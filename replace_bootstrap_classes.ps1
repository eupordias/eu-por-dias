$htmlFiles = Get-ChildItem -Path "C:\Users\updia\.gemini\antigravity\scratch\edugestao-alunos" -Recurse -Filter *.html
foreach ($file in $htmlFiles) {
  $content = Get-Content $file -Raw
  $content = $content -replace '\bd-d-flex\b', 'is-flex'
  $content = $content -replace '\balign-items-center\b', 'is-align-items-center'
  $content = $content -replace '\bjustify-between\b', 'is-justify-content-space-between'
  $content = $content -replace '\bgap-4\b', 'gap-4' # Bulma uses gap-4 already
  $content = $content -replace '\bmx-auto\b', 'mx-auto'
  # Add more replacements as needed
  Set-Content -Path $file -Value $content -Encoding UTF8
}
Write-Host "Bootstrap/Tailwind classes replaced with Bulma equivalents"
