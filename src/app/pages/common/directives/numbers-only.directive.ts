import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from "@angular/core";

@Directive({ selector: "[NumbersOnlyDirective]" })
export class NumbersOnlyDirective {
  // By Yogesh - original directive content shared by someone here https://stackoverflow.com/a/51866181

  // By Yogesh - By default it was "allowDecimals: boolean = true" ---> I changed it into "allowDecimals: boolean = false"

  // By Yogesh - Added a new input "returnResultInString: boolean = false"

  // By Yogesh - Steps to how to use this directive in our app https://prnt.sc/17px7bs

  @Input() allowDecimals: boolean = false;
  @Input() allowSign: boolean = false;
  @Input() returnResultInString: boolean = false;
  @Input() decimalSeparator: string = ".";

  // By Yogesh - Added eventemitter to allow two way data binding
  @Output() ngModelChange: EventEmitter<any> = new EventEmitter();

  previousValue: string = "";

  // --------------------------------------
  //  Regular expressions
  integerUnsigned: string = "^[0-9]*$";
  integerSigned: string = "^-?[0-9]+$";
  decimalUnsigned: string = "^[0-9]+(.[0-9]+)?$";
  decimalSigned: string = "^-?[0-9]+(.[0-9]+)?$";

  /**
   * Class constructor
   * @param hostElement
   */
  constructor(private hostElement: ElementRef) {}

  /**
   * Event handler for host's change event
   * @param e
   */
  @HostListener("change", ["$event"]) onChange(e) {
    this.validateValue(this.hostElement.nativeElement.value);
  }

  /**
   * Event handler for host's paste event
   * @param e
   */
  @HostListener("paste", ["$event"]) onPaste(e) {
    // get and validate data from clipboard
    let value = e.clipboardData.getData("text/plain");
    this.validateValue(value);
    e.preventDefault();
  }

  /**
   * Event handler for host's keydown event
   * @param event
   */
  @HostListener("keydown", ["$event"]) onKeyDown(e: KeyboardEvent) {
    let cursorPosition: number = e && e.target && e.target["selectionStart"];
    let originalValue: string = e && e.target && e.target["value"];
    let key: string = this.getName(e);
    let controlOrCommand = e.ctrlKey === true || e.metaKey === true;
    let signExists = originalValue.includes("-");
    let separatorExists = originalValue.includes(this.decimalSeparator);

    // allowed keys apart from numeric characters
    let allowedKeys = [
      "Backspace",
      "ArrowLeft",
      "ArrowRight",
      "Escape",
      "Tab",
      "Delete",
      "Enter",
    ];

    // when decimals are allowed, add
    // decimal separator to allowed codes when
    // its position is not close to the the sign (-. and .-)
    let separatorIsCloseToSign = signExists && cursorPosition <= 1;
    if (this.allowDecimals && !separatorIsCloseToSign && !separatorExists) {
      if (this.decimalSeparator == ".") allowedKeys.push(".");
      else allowedKeys.push(",");
    }

    // when minus sign is allowed, add its
    // key to allowed key only when the
    // cursor is in the first position, and
    // first character is different from
    // decimal separator
    let firstCharacterIsSeparator =
      originalValue.charAt(0) != this.decimalSeparator;
    if (
      this.allowSign &&
      !signExists &&
      firstCharacterIsSeparator &&
      cursorPosition == 0
    ) {
      allowedKeys.push("-");
    }

    // allow some non-numeric characters
    if (
      allowedKeys.indexOf(key) != -1 ||
      // Allow: Ctrl+A and Command+A
      (key == "a" && controlOrCommand) ||
      // Allow: Ctrl+C and Command+C
      (key == "c" && controlOrCommand) ||
      // Allow: Ctrl+V and Command+V
      (key == "v" && controlOrCommand) ||
      // Allow: Ctrl+X and Command+X
      (key == "x" && controlOrCommand)
    ) {
      // let it happen, don't do anything
      return;
    }

    // save value before keydown event
    this.previousValue = originalValue;

    // allow number characters only
    let isNumber = new RegExp(this.integerUnsigned).test(key);
    if (isNumber) return;
    else e.preventDefault();
  }

  /**
   * Test whether value is a valid number or not
   * @param value
   */
  validateValue(value: string): void {
    // choose the appropriate regular expression
    let regex: string = this.decimalUnsigned;
    // default regex value

    if (!this.allowDecimals && !this.allowSign) regex = this.integerUnsigned;
    if (!this.allowDecimals && this.allowSign) regex = this.integerSigned;
    if (this.allowDecimals && !this.allowSign) regex = this.decimalUnsigned;
    if (this.allowDecimals && this.allowSign) regex = this.decimalSigned;

    // when a numbers begins with a decimal separator,
    // fix it adding a zero in the beginning
    let firstCharacter = value.charAt(0);
    if (firstCharacter == this.decimalSeparator) value = 0 + value;

    // when a numbers ends with a decimal separator,
    // fix it adding a zero in the end
    let lastCharacter = value.charAt(value.length - 1);
    if (lastCharacter == this.decimalSeparator) value = value + 0;

    // test number with regular expression, when
    // number is invalid, replace it with a zero

    let valid: boolean = new RegExp(regex).test(value);

    // By Yogesh - It was originally not in code but this might be useful to check cases when element is required - Object.values(this.hostElement.nativeElement.attributes).includes("required")

    // By Yogesh - By default it was - this.hostElement.nativeElement["value"] = valid ? value : 0 ---> I amended it into below
    let finalValueToEmit: any = undefined;

    if (!this.returnResultInString) {
      finalValueToEmit =
        valid && value
          ? Number.isInteger(parseFloat(value))
            ? parseFloat(value)
            : Number(parseFloat(value).toFixed(2))
          : undefined;
    }

    if (this.returnResultInString) {
      finalValueToEmit = valid && value ? value.toString() : "";
    }

    this.ngModelChange.emit(finalValueToEmit);
  }

  /**
   * Get key's name
   * @param e
   */
  getName(e): string {
    if (e.key) {
      return e.key;
    } else {
      // for old browsers
      if (e.keyCode && String.fromCharCode) {
        switch (e.keyCode) {
          case 8:
            return "Backspace";
          case 9:
            return "Tab";
          case 27:
            return "Escape";
          case 37:
            return "ArrowLeft";
          case 39:
            return "ArrowRight";
          case 46:
            return "Delete";
          case 188:
            return ",";
          case 190:
            return ".";
          case 109:
          case 173:
          case 189:
            return "-";
          default:
            return String.fromCharCode(e.keyCode);
        }
      }
    }

    // final fallback (to satisfy return type)
    return "";
  }
}
