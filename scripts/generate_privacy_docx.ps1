$source = "c:\Users\ankur\work\mx-company-logo\PRIVACY_POLICY.md"
$target = "c:\Users\ankur\work\mx-company-logo\PRIVACY_POLICY.docx"
$tempRoot = Join-Path $env:TEMP ("privacy-docx-" + [guid]::NewGuid().ToString())

New-Item -ItemType Directory -Force -Path $tempRoot | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $tempRoot "_rels") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $tempRoot "word") | Out-Null

function Escape-Xml([string]$s) {
  return [System.Security.SecurityElement]::Escape($s)
}

$lines = Get-Content -Path $source
$paragraphs = New-Object System.Collections.Generic.List[string]

foreach ($line in $lines) {
  if ($line -match '^# (.+)$') {
    $text = Escape-Xml $matches[1]
    $paragraphs.Add("<w:p><w:r><w:rPr><w:b/><w:sz w:val='32'/></w:rPr><w:t>$text</w:t></w:r></w:p>")
  } elseif ($line -match '^## (.+)$') {
    $text = Escape-Xml $matches[1]
    $paragraphs.Add("<w:p><w:r><w:rPr><w:b/><w:sz w:val='26'/></w:rPr><w:t>$text</w:t></w:r></w:p>")
  } elseif ($line -match '^- (.+)$') {
    $text = Escape-Xml ("• " + $matches[1])
    $paragraphs.Add("<w:p><w:r><w:t>$text</w:t></w:r></w:p>")
  } elseif ([string]::IsNullOrWhiteSpace($line)) {
    $paragraphs.Add("<w:p/>")
  } else {
    $text = Escape-Xml $line
    $paragraphs.Add("<w:p><w:r><w:t xml:space='preserve'>$text</w:t></w:r></w:p>")
  }
}

$contentTypes = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>
"@

$rels = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>
"@

$document = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:w10="urn:schemas-microsoft-com:office:word" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml" xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup" xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk" xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml" xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape" mc:Ignorable="w14 wp14">
  <w:body>
    $($paragraphs -join "`n    ")
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708" w:footer="708" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>
"@

$contentTypes | Out-File -LiteralPath (Join-Path $tempRoot "[Content_Types].xml") -Encoding utf8
$rels | Out-File -LiteralPath (Join-Path $tempRoot "_rels\.rels") -Encoding utf8
$document | Out-File -LiteralPath (Join-Path $tempRoot "word\document.xml") -Encoding utf8

if (Test-Path $target) {
  Remove-Item $target -Force
}

Compress-Archive -Path (Join-Path $tempRoot "*") -DestinationPath ($target + ".zip") -Force
Rename-Item -Path ($target + ".zip") -NewName ([System.IO.Path]::GetFileName($target))
Remove-Item -Path $tempRoot -Recurse -Force

Write-Output "CREATED: $target"
