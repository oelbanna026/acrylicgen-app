param(
  [Parameter(Mandatory=$true)][string]$PropertyId,
  [Parameter(Mandatory=$true)][string]$MeasurementId,
  [Parameter(Mandatory=$true)][string]$ApiSecret,
  [Parameter(Mandatory=$true)][string]$ServiceAccountJsonPath,
  [string]$EnvPath = "c:/Users/Admin/Desktop/ACRILIC GENERATOR/server/.env"
)

$bytes = [IO.File]::ReadAllBytes($ServiceAccountJsonPath)
$b64 = [Convert]::ToBase64String($bytes)

$lines = @(
  "GA4_PROPERTY_ID=$PropertyId",
  "GA4_MEASUREMENT_ID=$MeasurementId",
  "GA4_API_SECRET=$ApiSecret",
  "GA4_SERVICE_ACCOUNT_JSON=$b64"
)

[IO.File]::WriteAllLines($EnvPath, $lines)
