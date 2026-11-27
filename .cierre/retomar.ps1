# retomar.ps1 - deja este proyecto listo para trabajar otra vez.
# Lo genero la skill "cerrar-proyecto". Lee .cierre\retomar.json y:
#   1) trae de vuelta los archivos pesados guardados en la bodega (y comprueba que llegaron bien)
#   2) vuelve a instalar las dependencias (node_modules, .venv, etc.)
#
# Uso, en PowerShell, desde la carpeta del proyecto:
#   powershell -ExecutionPolicy Bypass -File .cierre\retomar.ps1
# Opciones: -SoloArchivos (no instala dependencias)   -SoloDependencias (no descarga nada)
param([switch]$SoloArchivos, [switch]$SoloDependencias)

$ErrorActionPreference = 'Stop'
$raiz = Split-Path -Parent $PSScriptRoot
$rutaReceta = Join-Path $PSScriptRoot 'retomar.json'
if (-not (Test-Path -LiteralPath $rutaReceta)) {
    Write-Host "Este proyecto no tiene archivos pesados guardados aparte ni dependencias que reinstalar."
    Write-Host "Todo lo necesario esta en el repositorio. Mira el README para arrancarlo."
    exit 0
}
$receta = Get-Content -LiteralPath $rutaReceta -Raw -Encoding UTF8 | ConvertFrom-Json
$tmp = Join-Path $PSScriptRoot 'tmp-retomar'
$script:fallos = 0

function Get-Sha256([string]$ruta) {
    return (Get-FileHash -LiteralPath $ruta -Algorithm SHA256).Hash.ToLower()
}

function Get-TamanoCarpeta([string]$ruta) {
    if (-not (Test-Path -LiteralPath $ruta)) { return @{ n = 0; bytes = 0 } }
    $m = Get-ChildItem -LiteralPath $ruta -Recurse -File -Force -ErrorAction SilentlyContinue |
        Measure-Object -Property Length -Sum
    $suma = 0
    if ($m.Sum) { $suma = $m.Sum }
    return @{ n = $m.Count; bytes = $suma }
}

# Descarga (o copia) una parte desde la bodega y comprueba su sha256. Devuelve la ruta o $null.
function Get-Parte($a, $p) {
    New-Item -ItemType Directory -Force -Path $tmp | Out-Null
    $local = Join-Path $tmp $p.asset
    if ($a.bodega -eq 'github') {
        & gh release download $a.tag --repo $a.repo --pattern $p.asset --dir $tmp --clobber | Out-Host
        if ($LASTEXITCODE -ne 0) {
            Write-Host "   ERROR: no se pudo descargar $($p.asset) de $($a.repo). Revisa 'gh auth status'."
            return $null
        }
    } elseif ($a.bodega -eq 'rclone') {
        $rclone = 'rclone'
        if (-not (Get-Command rclone -ErrorAction SilentlyContinue)) {
            # Recien instalado con winget, el PATH nuevo no llega a las terminales ya abiertas.
            $winget = Join-Path $env:LOCALAPPDATA 'Microsoft\WinGet'
            $hallado = @(Join-Path $winget 'Links\rclone.exe') +
                @(Get-ChildItem -Path (Join-Path $winget 'Packages\Rclone.Rclone_*\*\rclone.exe') -ErrorAction SilentlyContinue |
                    Sort-Object FullName -Descending | ForEach-Object { $_.FullName }) |
                Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
            if (-not $hallado) {
                Write-Host "   ERROR: falta rclone. Instalalo con: winget install Rclone.Rclone"
                return $null
            }
            $rclone = $hallado
        }
        & $rclone copyto "$($a.base)/$($p.asset)" $local --retries 3 | Out-Host
        if ($LASTEXITCODE -ne 0) {
            Write-Host "   ERROR: no se pudo traer $($p.asset) desde $($a.base). Revisa 'rclone listremotes'."
            return $null
        }
    } elseif ($a.bodega -eq 'carpeta') {
        $origen = Join-Path $a.base $p.asset
        if (-not (Test-Path -LiteralPath $origen)) {
            Write-Host "   ERROR: no encuentro $origen. Conecta el disco de la bodega."
            return $null
        }
        Copy-Item -LiteralPath $origen -Destination $local -Force
    } else {
        Write-Host "   ERROR: bodega desconocida '$($a.bodega)'."
        return $null
    }
    if ((Get-Sha256 $local) -ne $p.sha256) {
        Write-Host "   ERROR: $($p.asset) llego danado (el sha256 no coincide)."
        return $null
    }
    return $local
}

if (-not $SoloDependencias) {
    foreach ($a in $receta.archivos) {
        $destino = Join-Path $raiz ($a.ruta -replace '/', '\')
        if ($a.tipo -eq 'archivo') {
            if ((Test-Path -LiteralPath $destino) -and ((Get-Item -LiteralPath $destino).Length -eq $a.bytes)) {
                Write-Host "ya esta: $($a.ruta)"
                continue
            }
            Write-Host "trayendo: $($a.ruta)"
            $local = Get-Parte $a $a.partes[0]
            if (-not $local) { $script:fallos++; continue }
            New-Item -ItemType Directory -Force -Path (Split-Path -Parent $destino) | Out-Null
            Move-Item -LiteralPath $local -Destination $destino -Force
        } else {
            $hay = Get-TamanoCarpeta $destino
            if (($hay.n -ge $a.n_archivos) -and ($hay.bytes -ge $a.bytes)) {
                Write-Host "ya esta: $($a.ruta)\"
                continue
            }
            Write-Host "trayendo carpeta: $($a.ruta)\  ($($a.n_archivos) archivos)"
            New-Item -ItemType Directory -Force -Path $destino | Out-Null
            $bien = $true
            foreach ($p in $a.partes) {
                $local = Get-Parte $a $p
                if (-not $local) { $bien = $false; break }
                # tar de Windows con ruta completa: el tar de Git Bash toma "C:" como un equipo remoto.
                $tarWin = Join-Path $env:SystemRoot 'System32\tar.exe'
                if (Test-Path -LiteralPath $tarWin) { & $tarWin -xf $local -C $destino } else { $global:LASTEXITCODE = 1 }
                if ($LASTEXITCODE -ne 0) {
                    Expand-Archive -LiteralPath $local -DestinationPath $destino -Force
                }
                Remove-Item -LiteralPath $local -Force
            }
            $hay = Get-TamanoCarpeta $destino
            if ((-not $bien) -or ($hay.n -lt $a.n_archivos) -or ($hay.bytes -lt $a.bytes)) {
                Write-Host "   ERROR: la carpeta $($a.ruta) quedo incompleta."
                $script:fallos++
            }
        }
    }
    if (Test-Path -LiteralPath $tmp) { Remove-Item -LiteralPath $tmp -Recurse -Force }
}

if (-not $SoloArchivos) {
    foreach ($d in $receta.dependencias) {
        $dir = Join-Path $raiz ($d.carpeta -replace '/', '\')
        Write-Host "dependencias en $($d.carpeta): $($d.comando)"
        Push-Location -LiteralPath $dir
        try {
            & cmd /c $d.comando
            if ($LASTEXITCODE -ne 0) {
                Write-Host "   ERROR: el comando termino con codigo $LASTEXITCODE."
                $script:fallos++
            }
        } finally {
            Pop-Location
        }
    }
}

if ($script:fallos -eq 0) {
    Write-Host "LISTO: el proyecto quedo como antes de cerrarlo."
} else {
    Write-Host "TERMINO CON $($script:fallos) PROBLEMA(S). Revisa los mensajes ERROR de arriba."
}
exit $script:fallos
