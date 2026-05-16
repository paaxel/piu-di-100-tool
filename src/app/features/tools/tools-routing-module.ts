import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { IbanChecker } from './iban-checker/iban-checker';
import { CfChecker } from './cf-checker/cf-checker';
import { JwtTool } from './jwt-tool/jwt-tool';
import { OneLine } from './one-line/one-line';
import { SpaceRemover } from './space-remover/space-remover';
import { StringLength } from './string-length/string-length';
import { UrlCodec } from './url-codec/url-codec';
import { UnitConverter } from './unit-converter/unit-converter';
import { JsonFormatter } from './json-formatter/json-formatter';
import { JsonYaml } from './json-yaml/json-yaml';
import { JsonCsv } from './json-csv/json-csv';
import { Epoch } from './epoch/epoch';
import { PasswordHash } from './password-hash/password-hash';
import { PasswordGenerator } from './password-generator/password-generator';
import { MyIp } from './my-ip/my-ip';
import { Cron } from './cron/cron';
import { PercentageCalculator } from './percentage/percentage';
import { IvaCalculator } from './iva-calculator/iva-calculator';
import { DiscountCalculator } from './discount-calculator/discount-calculator';
import { UuidGenerator } from './uuid-generator/uuid-generator';
import { RegexTester } from './regex-tester/regex-tester';
import { DiffChecker } from './diff-checker/diff-checker';
import { BaseConverter } from './base-converter/base-converter';
import { CaseConverter } from './case-converter/case-converter';
import { CaseTool } from './case-tool/case-tool';
import { WordCounter } from './word-counter/word-counter';
import { SlugGenerator } from './slug-generator/slug-generator';
import { AgeCalculator } from './age-calculator/age-calculator';
import { HtmlEncoder } from './html-encoder/html-encoder';
import { ColorConverter } from './color-converter/color-converter';
import { ColorPicker } from './color-picker/color-picker';
import { HexToRgb } from './hex-to-rgb/hex-to-rgb';
import { HexToHsl } from './hex-to-hsl/hex-to-hsl';
import { RgbToHex } from './rgb-to-hex/rgb-to-hex';
import { HslToHex } from './hsl-to-hex/hsl-to-hex';
import { RgbToHsl } from './rgb-to-hsl/rgb-to-hsl';
import { HslToRgb } from './hsl-to-rgb/hsl-to-rgb';
import { LoremIpsum } from './lorem-ipsum/lorem-ipsum';
import { SqlFormatter } from './sql-formatter/sql-formatter';
import { DateDiff } from './date-diff/date-diff';
import { TimezoneConverter } from './timezone-converter/timezone-converter';
import { PartitaIva } from './partita-iva/partita-iva';
import { HmacGenerator } from './hmac-generator/hmac-generator';
import { RandomToken } from './random-token/random-token';
import { RomanNumbers } from './roman-numbers/roman-numbers';
import { NumberWords } from './number-words/number-words';
import { JpgToWebp } from './jpg-to-webp/jpg-to-webp';
import { PngToWebp } from './png-to-webp/png-to-webp';
import { WebpConverter } from './webp-converter/webp-converter';
import { ImageResizer } from './image-resizer/image-resizer';
import { ImageToBase64 } from './image-to-base64/image-to-base64';
import { ImageCompressor } from './image-compressor/image-compressor';
import { ImageCrop } from './image-crop/image-crop';
import { FaviconGenerator } from './favicon-generator/favicon-generator';
import { TiraIlDado } from './tira-il-dado/tira-il-dado';
import { NumeroRandom } from './numero-random/numero-random';
import { TestaOCroce } from './testa-o-croce/testa-o-croce';
import { CreditCardValidator } from './credit-card-validator/credit-card-validator';
import { SemverChecker } from './semver-checker/semver-checker';
import { QrGenerator } from './qr-generator/qr-generator';
import { BarcodeGenerator } from './barcode-generator/barcode-generator';
import { BarcodeReader } from './barcode-reader/barcode-reader';
import { QrcodeReader } from './qrcode-reader/qrcode-reader';
import { TextInverter } from './text-inverter/text-inverter';
import { FindReplace } from './find-replace/find-replace';
import { ImageRotate } from './image-rotate/image-rotate';
import { ImageFlip } from './image-flip/image-flip';
import { ImageWatermark } from './image-watermark/image-watermark';
import { PaletteGenerator } from './palette-generator/palette-generator';
import { PaletteFromImage } from './palette-from-image/palette-from-image';
import { SubnetTool } from './subnet-tool/subnet-tool';
import { ImageColorPicker } from './image-color-picker/image-color-picker';
import { ImageBlur } from './image-blur/image-blur';
import { ImagePixelate } from './image-pixelate/image-pixelate';
import { PdfMerge } from './pdf-merge/pdf-merge';
import { PdfSplit } from './pdf-split/pdf-split';
import { PdfCompress } from './pdf-compress/pdf-compress';
import { PdfRotate } from './pdf-rotate/pdf-rotate';
import { PdfReorder } from './pdf-reorder/pdf-reorder';
import { PdfExtract } from './pdf-extract/pdf-extract';
import { PdfViewer } from './pdf-viewer/pdf-viewer';
import { PdfToImage } from './pdf-to-image/pdf-to-image';
import { ImageToPdf } from './image-to-pdf/image-to-pdf';
import { BmiCalculator } from './bmi-calculator/bmi-calculator';
import { GifMaker } from './gif-maker/gif-maker';
import { RandomWheel } from './random-wheel/random-wheel';
import { PomodoroTimer } from './pomodoro/pomodoro';
import { Stopwatch } from './stopwatch/stopwatch';
import { CountdownTimer } from './countdown-timer/countdown-timer';
import { TicTacToe } from './tic-tac-toe/tic-tac-toe';
import { TypingSpeed } from './typing-speed/typing-speed';
import { ReactionTime } from './reaction-time/reaction-time';

const routes: Routes = [
  { path: 'iban-checker', component: IbanChecker },
  { path: 'verifica-validita-codice-fiscale', component: CfChecker },
  { path: 'cf-checker', redirectTo: 'verifica-validita-codice-fiscale', pathMatch: 'full' },
  { path: 'jwt', component: JwtTool },
  { path: 'one-line', component: OneLine },
  { path: 'space-remover', component: SpaceRemover },
  { path: 'string-length', component: StringLength },
  { path: 'url-codec', component: UrlCodec },
  { path: 'unit-converter', component: UnitConverter },
  { path: 'json-formatter', component: JsonFormatter },
  { path: 'json-yaml', component: JsonYaml },
  { path: 'json-csv', component: JsonCsv },
  { path: 'epoch', component: Epoch },
  { path: 'password-hash', component: PasswordHash },
  { path: 'password-generator', component: PasswordGenerator },
  { path: 'my-ip', component: MyIp },
  { path: 'cron', component: Cron },
  { path: 'percentage', component: PercentageCalculator },
  { path: 'iva-calculator', component: IvaCalculator },
  { path: 'discount-calculator', component: DiscountCalculator },
  { path: 'uuid-generator', component: UuidGenerator },
  { path: 'regex-tester', component: RegexTester },
  { path: 'diff-checker', component: DiffChecker },
  { path: 'base-converter', component: BaseConverter },
  { path: 'case-converter', component: CaseConverter },
  { path: 'camel-case', component: CaseTool, data: { caseType: 'camel' } },
  { path: 'pascal-case', component: CaseTool, data: { caseType: 'pascal' } },
  { path: 'snake-case', component: CaseTool, data: { caseType: 'snake' } },
  { path: 'kebab-case', component: CaseTool, data: { caseType: 'kebab' } },
  { path: 'constant-case', component: CaseTool, data: { caseType: 'constant' } },
  { path: 'upper-case', component: CaseTool, data: { caseType: 'upper' } },
  { path: 'lower-case', component: CaseTool, data: { caseType: 'lower' } },
  { path: 'title-case', component: CaseTool, data: { caseType: 'title' } },
  { path: 'word-counter', component: WordCounter },
  { path: 'slug-generator', component: SlugGenerator },
  { path: 'age-calculator', component: AgeCalculator },
  { path: 'html-encoder', component: HtmlEncoder },
  { path: 'color-converter', component: ColorConverter },
  { path: 'color-picker', component: ColorPicker },
  { path: 'hex-to-rgb', component: HexToRgb },
  { path: 'hex-to-hsl', component: HexToHsl },
  { path: 'rgb-to-hex', component: RgbToHex },
  { path: 'hsl-to-hex', component: HslToHex },
  { path: 'rgb-to-hsl', component: RgbToHsl },
  { path: 'hsl-to-rgb', component: HslToRgb },
  { path: 'lorem-ipsum', component: LoremIpsum },
  { path: 'sql-formatter', component: SqlFormatter },
  { path: 'date-diff', component: DateDiff },
  { path: 'timezone-converter', component: TimezoneConverter },
  { path: 'partita-iva', component: PartitaIva },
  { path: 'hmac-generator', component: HmacGenerator },
  { path: 'random-token', component: RandomToken },
  { path: 'roman-numbers', component: RomanNumbers },
  { path: 'number-words', component: NumberWords },
  { path: 'jpg-to-webp', component: JpgToWebp },
  { path: 'png-to-webp', component: PngToWebp },
  { path: 'webp-converter', component: WebpConverter },
  { path: 'image-resizer', component: ImageResizer },
  { path: 'image-to-base64', component: ImageToBase64 },
  { path: 'image-compressor', component: ImageCompressor },
  { path: 'image-crop', component: ImageCrop },
  { path: 'favicon-generator', component: FaviconGenerator },
  { path: 'tira-il-dado', component: TiraIlDado },
  { path: 'numero-random', component: NumeroRandom },
  { path: 'testa-o-croce', component: TestaOCroce },
  { path: 'credit-card-validator', component: CreditCardValidator },
  { path: 'semver-checker', component: SemverChecker },
  { path: 'cidr-subnet-calculator', component: SubnetTool, data: { mode: 'cidr' } },
  { path: 'ip-subnet-calculator', component: SubnetTool, data: { mode: 'ip-mask' } },
  { path: 'qr-generator', component: QrGenerator },
  { path: 'barcode-generator', component: BarcodeGenerator },
  { path: 'barcode-reader', component: BarcodeReader },
  { path: 'qrcode-reader', component: QrcodeReader },
  { path: 'text-inverter', component: TextInverter },
  { path: 'find-replace', component: FindReplace },
  { path: 'image-rotate', component: ImageRotate },
  { path: 'image-flip', component: ImageFlip },
  { path: 'image-watermark', component: ImageWatermark },
  { path: 'palette-generator', component: PaletteGenerator },
  { path: 'palette-from-image', component: PaletteFromImage },
  { path: 'image-color-picker', component: ImageColorPicker },
  { path: 'image-blur', component: ImageBlur },
  { path: 'image-pixelate', component: ImagePixelate },
  { path: 'pdf-merge', component: PdfMerge },
  { path: 'pdf-split', component: PdfSplit },
  { path: 'pdf-compress', component: PdfCompress },
  { path: 'pdf-rotate', component: PdfRotate },
  { path: 'pdf-reorder', component: PdfReorder },
  { path: 'pdf-extract', component: PdfExtract },
  { path: 'pdf-viewer', component: PdfViewer },
  { path: 'pdf-to-image', component: PdfToImage },
  { path: 'image-to-pdf', component: ImageToPdf },
  { path: 'bmi-calculator', component: BmiCalculator },
  { path: 'gif-maker', component: GifMaker },
  { path: 'random-wheel', component: RandomWheel },
  { path: 'pomodoro', component: PomodoroTimer },
  { path: 'stopwatch', component: Stopwatch },
  { path: 'countdown-timer', component: CountdownTimer },
  { path: 'tic-tac-toe', component: TicTacToe },
  { path: 'typing-speed', component: TypingSpeed },
  { path: 'reaction-time', component: ReactionTime },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ToolsRoutingModule {}
