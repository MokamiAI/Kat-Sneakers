$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$outputDir = Join-Path (Get-Location) 'docs\deliverables'
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null
$outputPath = Join-Path $outputDir 'Kat Sneakers - App Overview.docx'
$parts = @{}
function Escape-Xml([string]$value) { [System.Security.SecurityElement]::Escape($value) }
function Para([string]$value,[string]$style='Normal') {
  '<w:p><w:pPr><w:pStyle w:val="'+$style+'"/></w:pPr><w:r><w:t xml:space="preserve">'+(Escape-Xml $value)+'</w:t></w:r></w:p>'
}
function Item([string]$value,[int]$num=1) {
  '<w:p><w:pPr><w:pStyle w:val="PitchList"/><w:numPr><w:ilvl w:val="0"/><w:numId w:val="'+$num+'"/></w:numPr></w:pPr><w:r><w:t>'+(Escape-Xml $value)+'</w:t></w:r></w:p>'
}
function Link([string]$label,[string]$id) {
  '<w:p><w:pPr><w:pStyle w:val="LinkText"/></w:pPr><w:hyperlink r:id="'+$id+'"><w:r><w:rPr><w:u w:val="single"/></w:rPr><w:t>'+(Escape-Xml $label)+'</w:t></w:r></w:hyperlink></w:p>'
}
$pageBreak='<w:p><w:r><w:br w:type="page"/></w:r></w:p>'
$body = New-Object System.Text.StringBuilder
function Add([string]$value) { [void]$body.Append($value) }

Add (Para 'KAT SNEAKERS' 'Kicker')
Add (Para 'A pair for every day.' 'Title')
Add (Para 'App overview and interactive concept' 'Subtitle')
Add (Para '19 October 2026  |  South Africa  |  Customer and store management experience' 'Meta')
Add (Para 'THE IDEA' 'Heading1')
Add (Para 'Kat Sneakers brings sneaker discovery, ordering and store management into one simple experience. Customers explore styles and prices, choose their UK size, place an order and follow its progress. Store staff use one dashboard to review payments, prepare orders and communicate delivery updates.')
Add (Para 'The current website is a clickable presentation with fictional products, prices, customers and orders. It demonstrates the proposed experience; it does not process real payments, create secure accounts or send messages.' 'Callout')
Add (Para 'What customers can explore' 'Heading1')
Add (Item 'Collections for New In, Men, Women, Kids, Brands and Sale, with product photography and South African rand prices.')
Add (Item 'Search, category and budget filters, brand browsing, and price sorting to find a suitable pair quickly.')
Add (Item 'An animated sale showcase beside the homepage hero. Shoes change automatically every four seconds; the yellow tag updates with the mock sale price, original price and saving.')
Add (Item 'Clickable shoe details with price, colour and UK size choices, plus an indicative size guide.')
Add (Item 'A shopping bag, customer login and sign-up screens, checkout, payment-proof steps and order tracking.')
Add (Para 'Why the experience matters' 'Heading1')
Add (Para 'Clear prices and size selection make shopping easier. A visible order journey gives customers a clear next step, while a shared admin workspace shows how the retailer could manage sales from payment review through dispatch.')
Add (Link 'Explore the live storefront' 'site')
Add (Link 'Open the guided presentation walkthrough' 'demo')

Add $pageBreak
Add (Para 'THE CUSTOMER EXPERIENCE' 'Kicker')
Add (Para 'From first look to delivery.' 'Title')
Add (Para 'The mockup lets a presenter walk through the full buying journey without a backend or real customer information.' 'Subtitle')
Add (Para 'A simple shopping journey' 'Heading1')
Add (Item 'Discover a pair. Browse collections, search by brand or style, or click a shoe in the rotating sale showcase to open that sale item.' 2)
Add (Item 'Choose a size. Open the product details, review its mock price and colour, select a UK size and add the pair to the bag.' 2)
Add (Item 'Sign in or join. Use the visible Sign in and Join links beside the bag. Any details pass through in the presentation; passwords are not saved or checked.' 2)
Add (Item 'Review the bag and check out. See the selected items, quantities and total. Customer and delivery fields are prefilled, and a sample bag is supplied if the bag is empty.' 2)
Add (Item 'Place the order. Receive a sample order reference and a total including the mock R79 delivery fee. The flow shows what the customer would see after ordering.' 2)
Add (Item 'Follow the EFT payment step. View fictional bank information and a payment reference, then submit a sample proof with or without choosing a file. No money is transferred and no file is uploaded.' 2)
Add (Item 'Track the order. View the order details and activity history as staff approve payment, pack the shoes and mark the order shipped with courier and tracking information.' 2)
Add (Para 'Ready for a smooth walkthrough' 'Heading1')
Add (Para 'The account page previews order history and password recovery. Prefilled forms and pass-through login keep the presentation moving. A reset button restores the sample data for the next audience.')
Add (Para 'Illustrative offer: the orange Nike Everyday Air is shown at R499, previously R799. All prices and availability in this concept are mock data, not confirmed retail offers.' 'Callout')

Add $pageBreak
Add (Para 'THE STORE MANAGEMENT EXPERIENCE' 'Kicker')
Add (Para 'Behind every good order.' 'Title')
Add (Para 'The admin area demonstrates how the store could keep sales, payment review and fulfilment in one workspace.' 'Subtitle')
Add (Para 'What the admin mockup shows' 'Heading1')
Add (Item 'Dashboard: sample confirmed-sales totals and queues for payment proofs, orders ready to pack and orders on the way. Six fictional orders are supplied at different stages.')
Add (Item 'Order workspace: search by order reference, customer or tracking information; filter by status; open customer details, purchased items, sizes, totals and activity history.')
Add (Item 'Payment review: inspect a sample proof, demonstrate payment approval or rejection, and preview the explanation a customer would receive.')
Add (Item 'Record a sale: add a phone, social media or in-store order using prefilled customer and product information, with an optional sample proof.')
Add (Item 'Packing and dispatch: demonstrate the packing checklist, enter sample courier and tracking details, then mark the order shipped or delivered.')
Add (Item 'Customer updates: preview messages associated with order changes. They are labelled as sent in the simulation; no email or WhatsApp message is actually sent.')
Add (Para 'The order journey' 'Heading1')
Add (Para 'Awaiting payment > Proof to check > Paid, to pack > Packed > Shipped > Delivered. A rejected proof can be demonstrated and replaced. These are presentation states, not enforced payment or inventory controls.' 'Callout')
Add (Para 'Ready to present; development comes next' 'Heading1')
Add (Para 'The current static wireframe uses mock data. Admin opens without credentials, and a reset button restores sample orders.')
Add (Para 'Future development will add secure accounts, databases, real stock, private proof storage, payment and delivery setup, notifications and production hosting. These services are not active yet.')
Add (Link 'Present the idea: mokamiai.github.io/Kat-Sneakers/demo.html' 'demo')

$parts['[Content_Types].xml']='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/><Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>'
$parts['_rels/.rels']='<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="document" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="core" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>'
$parts['docProps/core.xml']='<?xml version="1.0" encoding="UTF-8"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>Kat Sneakers - App Overview</dc:title><dc:creator>Kat Sneakers</dc:creator><dc:description>Customer and admin features in the interactive mockup, with future development clearly distinguished.</dc:description><dcterms:created xsi:type="dcterms:W3CDTF">2026-10-19T00:00:00Z</dcterms:created></cp:coreProperties>'
$parts['word/_rels/document.xml.rels']='<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="styles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="numbers" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/><Relationship Id="footer" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/><Relationship Id="site" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="https://mokamiai.github.io/Kat-Sneakers/" TargetMode="External"/><Relationship Id="demo" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="https://mokamiai.github.io/Kat-Sneakers/demo.html" TargetMode="External"/></Relationships>'
$parts['word/document.xml']='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><w:body>'+$body.ToString()+'<w:sectPr><w:footerReference w:type="default" r:id="footer"/><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708" w:footer="708"/><w:cols w:space="720"/></w:sectPr></w:body></w:document>'
# standard_business_brief preset, with named brand overrides: black headings,
# yellow callouts, and compact 28pt commercial title (customer_pack header).
$parts['word/styles.xml']=@'
<?xml version="1.0" encoding="UTF-8"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/><w:color w:val="111111"/><w:lang w:val="en-ZA"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:before="0" w:after="120" w:line="264" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>
<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:pPr><w:spacing w:before="0" w:after="120" w:line="264" w:lineRule="auto"/></w:pPr><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/><w:color w:val="111111"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:pPr><w:keepNext/><w:spacing w:before="0" w:after="160" w:line="264" w:lineRule="auto"/></w:pPr><w:rPr><w:b/><w:sz w:val="56"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Subtitle"><w:name w:val="Subtitle"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:before="0" w:after="160"/></w:pPr><w:rPr><w:sz w:val="23"/><w:color w:val="555555"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:pPr><w:keepNext/><w:keepLines/><w:spacing w:before="320" w:after="160" w:line="264" w:lineRule="auto"/><w:outlineLvl w:val="0"/></w:pPr><w:rPr><w:b/><w:sz w:val="32"/><w:color w:val="111111"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:pPr><w:keepNext/><w:spacing w:before="240" w:after="120" w:line="264" w:lineRule="auto"/><w:outlineLvl w:val="1"/></w:pPr><w:rPr><w:b/><w:sz w:val="26"/><w:color w:val="111111"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading3"><w:name w:val="heading 3"/><w:basedOn w:val="Normal"/><w:pPr><w:keepNext/><w:spacing w:before="160" w:after="80" w:line="264" w:lineRule="auto"/><w:outlineLvl w:val="2"/></w:pPr><w:rPr><w:b/><w:sz w:val="24"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Kicker"><w:name w:val="Brand kicker"/><w:basedOn w:val="Normal"/><w:pPr><w:keepNext/><w:spacing w:before="0" w:after="180"/></w:pPr><w:rPr><w:b/><w:sz w:val="19"/><w:spacing w:val="20"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Meta"><w:name w:val="Document metadata"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:before="0" w:after="160"/></w:pPr><w:rPr><w:sz w:val="17"/><w:color w:val="666666"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="PitchList"><w:name w:val="Pitch list"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:before="0" w:after="160" w:line="280" w:lineRule="auto"/><w:ind w:left="720" w:hanging="360"/></w:pPr></w:style>
<w:style w:type="paragraph" w:styleId="Callout"><w:name w:val="Brand callout"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:before="100" w:after="160" w:line="264" w:lineRule="auto"/><w:shd w:fill="FFF3BF"/></w:pPr><w:rPr><w:sz w:val="20"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="LinkText"><w:name w:val="Link text"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:before="0" w:after="100"/></w:pPr><w:rPr><w:sz w:val="19"/></w:rPr></w:style>
</w:styles>
'@
$parts['word/numbering.xml']='<?xml version="1.0" encoding="UTF-8"?><w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:abstractNum w:abstractNumId="0"><w:multiLevelType w:val="singleLevel"/><w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="&#8226;"/><w:lvlJc w:val="left"/><w:pPr><w:tabs><w:tab w:val="num" w:pos="720"/></w:tabs><w:ind w:left="720" w:hanging="360"/><w:spacing w:after="160" w:line="280" w:lineRule="auto"/></w:pPr></w:lvl></w:abstractNum><w:abstractNum w:abstractNumId="1"><w:multiLevelType w:val="singleLevel"/><w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="decimal"/><w:lvlText w:val="%1."/><w:lvlJc w:val="left"/><w:pPr><w:tabs><w:tab w:val="num" w:pos="720"/></w:tabs><w:ind w:left="720" w:hanging="360"/><w:spacing w:after="160" w:line="280" w:lineRule="auto"/></w:pPr></w:lvl></w:abstractNum><w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num><w:num w:numId="2"><w:abstractNumId w:val="1"/></w:num></w:numbering>'
$parts['word/footer1.xml']='<?xml version="1.0" encoding="UTF-8"?><w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:p><w:pPr><w:tabs><w:tab w:val="right" w:pos="9360"/></w:tabs><w:spacing w:after="0"/></w:pPr><w:r><w:rPr><w:sz w:val="17"/><w:color w:val="666666"/></w:rPr><w:t>Kat Sneakers | Interactive concept | Mock data</w:t><w:tab/></w:r><w:r><w:rPr><w:sz w:val="17"/></w:rPr><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:instrText> PAGE </w:instrText></w:r><w:r><w:fldChar w:fldCharType="end"/></w:r></w:p></w:ftr>'

# Validate every XML part before packaging it as an Office document.
foreach($entry in $parts.GetEnumerator()){[xml]$entry.Value | Out-Null}
$stream=[System.IO.File]::Open($outputPath,[System.IO.FileMode]::Create)
$zip=New-Object System.IO.Compression.ZipArchive($stream,[System.IO.Compression.ZipArchiveMode]::Create)
try { foreach($entry in $parts.GetEnumerator()) { $item=$zip.CreateEntry($entry.Key);$writer=New-Object System.IO.StreamWriter($item.Open(),(New-Object System.Text.UTF8Encoding($false)));try{$writer.Write($entry.Value)}finally{$writer.Dispose()} } } finally {$zip.Dispose();$stream.Dispose()}
Write-Output $outputPath
Write-Output ('OOXML checks passed: '+$parts.Count+' parts; Letter pages, explicit styles, real numbering and hyperlinks.')
