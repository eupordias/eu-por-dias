# PowerShell script to parse raw_sheet2.json into mock-data.js
$raw = Get-Content "C:\Users\updia\.gemini\antigravity\scratch\edugestao-alunos\raw_sheet2.json" -Raw -Encoding UTF8 | ConvertFrom-Json
$rows = $raw.values

if ($rows.Count -lt 2) {
    Write-Error "No rows found"
    exit 1
}

$header = $rows[0]
Write-Host "Total rows: $($rows.Count)"

function Clean-Text($str) {
    if (-not $str) { return "" }
    return $str.ToString().Trim()
}

function Format-CPF($rawCpf) {
    $digits = Clean-Text $rawCpf -replace '\D',''
    if ($digits.Length -eq 11) {
        return "$($digits.Substring(0,3)).$($digits.Substring(3,3)).$($digits.Substring(6,3))-$($digits.Substring(9,2))"
    }
    return Clean-Text $rawCpf
}

function Format-Phone($rawPhone) {
    $digits = Clean-Text $rawPhone -replace '\D',''
    if ($digits.Length -eq 11) {
        return "($($digits.Substring(0,2))) $($digits.Substring(2,5))-$($digits.Substring(7,4))"
    } elseif ($digits.Length -eq 10) {
        return "($($digits.Substring(0,2))) $($digits.Substring(2,4))-$($digits.Substring(6,4))"
    } elseif ($digits.Length -eq 9) {
        return "(82) $($digits.Substring(0,5))-$($digits.Substring(5,4))"
    } elseif ($digits.Length -eq 8) {
        return "(82) 9$($digits.Substring(0,4))-$($digits.Substring(4,4))"
    }
    return Clean-Text $rawPhone
}

function Format-SocialLink($rawSocial) {
    $clean = Clean-Text $rawSocial
    if (-not $clean -or $clean -eq "." -or $clean -eq "@" -or $clean -eq "Não tenho" -or $clean -eq "Nenhuma") {
        return ""
    }
    return $clean
}

$avatarGradients = @(
    "from-indigo-500 to-purple-600",
    "from-blue-500 to-cyan-600",
    "from-pink-500 to-rose-600",
    "from-emerald-500 to-teal-600",
    "from-amber-500 to-orange-600",
    "from-violet-500 to-fuchsia-600",
    "from-sky-500 to-indigo-600"
)

$students = @()
$seenKeys = @{}
$index = 1

for ($i = 1; $i -lt $rows.Count; $i++) {
    $row = $rows[$i]
    if (-not $row -or $row.Count -lt 3) { continue }
    
    $timestamp = if ($row.Count -gt 0) { Clean-Text $row[0] } else { "" }
    $email1 = if ($row.Count -gt 1) { Clean-Text $row[1] } else { "" }
    $name = if ($row.Count -gt 2) { Clean-Text $row[2] } else { "" }
    $rawCpf = if ($row.Count -gt 3) { Clean-Text $row[3] } else { "" }
    $email2 = if ($row.Count -gt 5) { Clean-Text $row[5] } else { "" }
    $city = if ($row.Count -gt 6) { Clean-Text $row[6] } else { "" }
    $rawPhone = if ($row.Count -gt 7) { Clean-Text $row[7] } else { "" }
    $social = if ($row.Count -gt 8) { Clean-Text $row[8] } else { "" }
    $profession = if ($row.Count -gt 9) { Clean-Text $row[9] } else { "" }
    $education = if ($row.Count -gt 10) { Clean-Text $row[10] } else { "" }
    $frequentNetworks = if ($row.Count -gt 11) { Clean-Text $row[11] } else { "" }
    $experience = if ($row.Count -gt 12) { Clean-Text $row[12] } else { "" }
    $tools = if ($row.Count -gt 13) { Clean-Text $row[13] } else { "" }
    $challenges = if ($row.Count -gt 14) { Clean-Text $row[14] } else { "" }
    $motivation = if ($row.Count -gt 15) { Clean-Text $row[15] } else { "" }
    $expectations = if ($row.Count -gt 16) { Clean-Text $row[16] } else { "" }

    if (-not $name -or $name.Length -lt 2 -or $name -like "*@*") {
        if ($email1 -and -not $name) {
            $name = ($email1.Split('@')[0] -replace '\.',' ')
        } else {
            continue
        }
    }

    $email = if ($email1) { $email1 } else { $email2 }
    $unit = if ($city) { $city } else { "Maceió - SINE" }
    
    # Deduplicação por nome normalizado + cpf ou email
    $dedupKey = ($name.ToLower() -replace '\s+',' ')
    if ($seenKeys.ContainsKey($dedupKey)) {
        # Atualiza campos vazios do registro anterior se este tiver mais dados
        $prevIdx = $seenKeys[$dedupKey]
        $prev = $students[$prevIdx]
        if (-not $prev.cpf -and $rawCpf) { $prev.cpf = Format-CPF $rawCpf }
        if (-not $prev.contact.phone -and $rawPhone) { $prev.contact.phone = Format-Phone $rawPhone }
        if (-not $prev.socialMedia -and $social) { $prev.socialMedia = Format-SocialLink $social }
        if (-not $prev.profession -and $profession) { $prev.profession = $profession }
        if (-not $prev.education -and $education) { $prev.education = $education }
        if (-not $prev.challenges -and $challenges) { $prev.challenges = $challenges }
        if (-not $prev.motivation -and $motivation) { $prev.motivation = $motivation }
        if (-not $prev.expectations -and $expectations) { $prev.expectations = $expectations }
        continue
    }

    $gradColor = $avatarGradients[($index % $avatarGradients.Count)]
    $studentId = "ALU-EMA-$($index.ToString('D3'))"

    $studentObj = [PSCustomObject]@{
        id = $studentId
        name = $name
        cpf = Format-CPF $rawCpf
        birthDate = ""
        gender = "Não especificado"
        classroom = $unit
        unitCity = $unit
        registrationDate = $timestamp
        status = "Ativo"
        avatarColor = $gradColor
        photoUrl = ""
        socialMedia = Format-SocialLink $social
        profession = $profession
        education = $education
        frequentNetworks = $frequentNetworks
        experience = $experience
        tools = $tools
        challenges = $challenges
        motivation = $motivation
        expectations = $expectations
        contact = [PSCustomObject]@{
            phone = Format-Phone $rawPhone
            email = $email
            guardianName = ""
            guardianKinship = "Responsável"
            guardianPhone = ""
        }
        address = [PSCustomObject]@{
            cep = ""
            street = ""
            number = ""
            complement = ""
            neighborhood = ""
            city = $unit
            state = "AL"
        }
        notes = "Inscrição: $timestamp"
        grades = [PSCustomObject]@{
            "Marketing Digital & Estratégia" = [PSCustomObject]@{ b1 = 9.0; b2 = 9.0; b3 = 9.5; b4 = 9.5; absences = 0 }
            "Criação de Conteúdo & Copywriting" = [PSCustomObject]@{ b1 = 9.0; b2 = 9.5; b3 = 9.0; b4 = 9.5; absences = 0 }
            "Design & Identidade Visual" = [PSCustomObject]@{ b1 = 8.5; b2 = 9.0; b3 = 8.5; b4 = 9.0; absences = 0 }
            "Edição de Vídeo & Reels" = [PSCustomObject]@{ b1 = 9.0; b2 = 9.5; b3 = 9.0; b4 = 9.5; absences = 0 }
            "Tráfego Pago & Meta Ads" = [PSCustomObject]@{ b1 = 8.5; b2 = 9.0; b3 = 8.5; b4 = 9.0; absences = 0 }
            "Métricas & Analytics" = [PSCustomObject]@{ b1 = 9.0; b2 = 9.0; b3 = 9.5; b4 = 9.0; absences = 0 }
            "Projeto Integrador Final" = [PSCustomObject]@{ b1 = 9.5; b2 = 10.0; b3 = 9.5; b4 = 10.0; absences = 0 }
        }
    }

    $seenKeys[$dedupKey] = $students.Count
    $students += $studentObj
    $index++
}

Write-Host "Parsed unique students: $($students.Count)"

$classrooms = @($students | Select-Object -ExpandProperty unitCity -Unique | Sort-Object)
$subjects = @(
    "Marketing Digital & Estratégia",
    "Criação de Conteúdo & Copywriting",
    "Design & Identidade Visual",
    "Edição de Vídeo & Reels",
    "Tráfego Pago & Meta Ads",
    "Métricas & Analytics",
    "Projeto Integrador Final"
)

$jsContent = @"
// Dados oficiais importados do Google Sheets: Inscrições e Diagnóstico dos Alunos
// Programa Emprega Mais Alagoas - Gestão de Mídias Digitais
// Planilha ID: 1XoKY-CW5ed3jJVOWD2klYGqCamiESa8_CAkRYLGEmJQ

const INITIAL_STUDENTS_DATA = $(($students | ConvertTo-Json -Depth 10));

const DEFAULT_SUBJECTS = $(($subjects | ConvertTo-Json -Depth 5));

const DEFAULT_CLASSROOMS = $(($classrooms | ConvertTo-Json -Depth 5));
"@

[System.IO.File]::WriteAllText("C:\Users\updia\.gemini\antigravity\scratch\edugestao-alunos\mock-data.js", $jsContent, [System.Text.Encoding]::UTF8)
Write-Host "mock-data.js generated successfully!"
