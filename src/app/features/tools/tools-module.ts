import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../../shared/shared-module';
import { ToolsRoutingModule } from './tools-routing-module';

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

@NgModule({
  declarations: [
    IbanChecker,
    CfChecker,
    JwtTool,
    OneLine,
    SpaceRemover,
    StringLength,
    UrlCodec,
    UnitConverter,
    JsonFormatter,
    JsonYaml,
    JsonCsv,
    Epoch,
    PasswordHash,
    PasswordGenerator,
    MyIp,
    Cron,
    PercentageCalculator,
    IvaCalculator,
    DiscountCalculator,
    UuidGenerator,
    RegexTester,
    DiffChecker,
    BaseConverter,
    CaseConverter,
    CaseTool,
    WordCounter,
    SlugGenerator,
    AgeCalculator,
    HtmlEncoder,
    ColorConverter,
    ColorPicker,
    HexToRgb,
    HexToHsl,
    RgbToHex,
    HslToHex,
    RgbToHsl,
    HslToRgb,
    LoremIpsum,
    SqlFormatter,
    DateDiff,
    TimezoneConverter,
    PartitaIva,
    HmacGenerator,
    RandomToken,
    RomanNumbers,
    NumberWords,
    JpgToWebp,
    PngToWebp,
    WebpConverter,
    ImageResizer,
    ImageToBase64,
    ImageCompressor,
    ImageCrop,
    FaviconGenerator,
    TiraIlDado,
    NumeroRandom,
    TestaOCroce,
    CreditCardValidator,
    SemverChecker,
    QrGenerator,
    BarcodeGenerator,
    BarcodeReader,
    QrcodeReader,
    TextInverter,
    FindReplace,
    ImageRotate,
    ImageFlip,
    ImageWatermark,
    PaletteGenerator,
    PaletteFromImage,
    SubnetTool,
    ImageColorPicker,
    ImageBlur,
    ImagePixelate,
    PdfMerge,
    PdfSplit,
    PdfCompress,
    PdfRotate,
    PdfReorder,
    PdfExtract,
    PdfViewer,
    PdfToImage,
    ImageToPdf,
    BmiCalculator,
    GifMaker,
    RandomWheel,
    PomodoroTimer,
    Stopwatch,
    CountdownTimer,
    TicTacToe,
    TypingSpeed,
    ReactionTime,
  ],
  imports: [CommonModule, SharedModule, ToolsRoutingModule],
})
export class ToolsModule {}
