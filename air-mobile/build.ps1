param([Parameter(Mandatory=$true)][string]$AirSdk)
$ErrorActionPreference = 'Stop'
$project = $PSScriptRoot
$sdkRoot = (Resolve-Path -LiteralPath $AirSdk).Path
foreach ($tool in @('lib\mxmlc.jar','lib\adt.jar')) {
 if (!(Test-Path -LiteralPath (Join-Path $sdkRoot $tool))) { throw "AIR SDK missing $tool" }
}
$privateDir = Join-Path $project 'private'
$outputDir = Join-Path $project 'output'
New-Item -ItemType Directory -Force $privateDir,$outputDir | Out-Null
$game = Join-Path $privateDir 'game.swf'
if (!(Test-Path -LiteralPath $game)) {
 Invoke-WebRequest 'https://hh-rewritten.com/client/game.swf' -OutFile $game -UseBasicParsing
}
if ((Get-Item -LiteralPath $game).Length -lt 100000) { throw 'Game download is unexpectedly small' }
$launcher = Join-Path $outputDir 'MobileLauncher.swf'
& java -jar (Join-Path $sdkRoot 'lib\mxmlc.jar') "-load-config=$sdkRoot\frameworks\air-config.xml" '-swf-version=41' "-output=$launcher" (Join-Path $project 'src\MobileLauncher.as')
if ($LASTEXITCODE) { throw 'ActionScript compilation failed' }
$cert = Join-Path $privateDir 'prototype.p12'
if (!(Test-Path -LiteralPath $cert)) {
 & java -jar (Join-Path $sdkRoot 'lib\adt.jar') -certificate -cn HHRMobilePrototype 2048-RSA $cert prototype
 if ($LASTEXITCODE) { throw 'Prototype certificate creation failed' }
}
& java -jar (Join-Path $sdkRoot 'lib\adt.jar') -package -target apk-captive-runtime -arch armv8 -storetype pkcs12 -keystore $cert -storepass prototype (Join-Path $outputDir 'Helmet-Heroes-AIR-prototype.apk') (Join-Path $project 'application.xml') -C $outputDir MobileLauncher.swf
if ($LASTEXITCODE) { throw 'Android AIR packaging failed' }
