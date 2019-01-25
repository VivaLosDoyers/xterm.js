/**
 * Copyright (c) 2017 The xterm.js authors. All rights reserved.
 * @license MIT
 */

import { Terminal as PublicTerminal, ITerminalOptions as IPublicTerminalOptions, IEventEmitter, IDisposable } from 'xterm';
import { IColorSet, IRenderer } from './renderer/Types';
import { IMouseZoneManager } from './ui/Types';
import { ICharset } from './core/Types';
import { ICircularList } from './common/Types';

export type CustomKeyEventHandler = (event: KeyboardEvent) => boolean;

export type CharData = [number, string, number, number];
export type LineData = CharData[];

export type LinkMatcherHandler = (event: MouseEvent, uri: string) => void;
export type LinkMatcherValidationCallback = (uri: string, callback: (isValid: boolean) => void) => void;

export type CharacterJoinerHandler = (text: string) => [number, number][];

// BufferIndex denotes a position in the buffer: [rowIndex, colIndex]
export type BufferIndex = [number, number];

export const enum LinkHoverEventTypes {
  HOVER = 'linkhover',
  TOOLTIP = 'linktooltip',
  LEAVE = 'linkleave'
}

/**
 * This interface encapsulates everything needed from the Terminal by the
 * InputHandler. This cleanly separates the large amount of methods needed by
 * InputHandler cleanly from the ITerminal interface.
 */
export interface IInputHandlingTerminal extends IEventEmitter {
  element: HTMLElement;
  options: ITerminalOptions;
  cols: number;
  rows: number;
  charset: ICharset;
  gcharset: number;
  glevel: number;
  charsets: ICharset[];
  applicationKeypad: boolean;
  applicationCursor: boolean;
  originMode: boolean;
  insertMode: boolean;
  wraparoundMode: boolean;
  bracketedPasteMode: boolean;
  curAttr: number;
  savedCols: number;
  x10Mouse: boolean;
  vt200Mouse: boolean;
  normalMouse: boolean;
  mouseEvents: boolean;
  sendFocus: boolean;
  utfMouse: boolean;
  sgrMouse: boolean;
  urxvtMouse: boolean;
  cursorHidden: boolean;

  buffers: IBufferSet;
  buffer: IBuffer;
  viewport: IViewport;
  selectionManager: ISelectionManager;

  bell(): void;
  focus(): void;
  updateRange(y: number): void;
  scroll(isWrapped?: boolean): void;
  setgLevel(g: number): void;
  eraseAttr(): number;
  is(term: string): boolean;
  setgCharset(g: number, charset: ICharset): void;
  resize(x: number, y: number): void;
  log(text: string, data?: any): void;
  reset(): void;
  showCursor(): void;
  refresh(start: number, end: number): void;
  matchColor(r1: number, g1: number, b1: number): number;
  error(text: string, data?: any): void;
  setOption(key: string, value: any): void;
  tabSet(): void;
  handler(data: string): void;
  handleTitle(title: string): void;
  index(): void;
  reverseIndex(): void;
}

export interface IViewport extends IDisposable {
  scrollBarWidth: number;
  syncScrollArea(): void;
  getLinesScrolled(ev: WheelEvent): number;
  onWheel(ev: WheelEvent): void;
  onTouchStart(ev: TouchEvent): void;
  onTouchMove(ev: TouchEvent): void;
  onThemeChanged(colors: IColorSet): void;
}

export interface ICompositionHelper {
  compositionstart(): void;
  compositionupdate(ev: CompositionEvent): void;
  compositionend(): void;
  updateCompositionElements(dontRecurse?: boolean): void;
  keydown(ev: KeyboardEvent): boolean;
}

/**
 * Calls the parser and handles actions generated by the parser.
 */
export interface IInputHandler {
  parse(data: string): void;
  print(data: Uint32Array, start: number, end: number): void;

  /** C0 BEL */ bell(): void;
  /** C0 LF */ lineFeed(): void;
  /** C0 CR */ carriageReturn(): void;
  /** C0 BS */ backspace(): void;
  /** C0 HT */ tab(): void;
  /** C0 SO */ shiftOut(): void;
  /** C0 SI */ shiftIn(): void;

  /** CSI @ */ insertChars(params?: number[]): void;
  /** CSI A */ cursorUp(params?: number[]): void;
  /** CSI B */ cursorDown(params?: number[]): void;
  /** CSI C */ cursorForward(params?: number[]): void;
  /** CSI D */ cursorBackward(params?: number[]): void;
  /** CSI E */ cursorNextLine(params?: number[]): void;
  /** CSI F */ cursorPrecedingLine(params?: number[]): void;
  /** CSI G */ cursorCharAbsolute(params?: number[]): void;
  /** CSI H */ cursorPosition(params?: number[]): void;
  /** CSI I */ cursorForwardTab(params?: number[]): void;
  /** CSI J */ eraseInDisplay(params?: number[]): void;
  /** CSI K */ eraseInLine(params?: number[]): void;
  /** CSI L */ insertLines(params?: number[]): void;
  /** CSI M */ deleteLines(params?: number[]): void;
  /** CSI P */ deleteChars(params?: number[]): void;
  /** CSI S */ scrollUp(params?: number[]): void;
  /** CSI T */ scrollDown(params?: number[], collect?: string): void;
  /** CSI X */ eraseChars(params?: number[]): void;
  /** CSI Z */ cursorBackwardTab(params?: number[]): void;
  /** CSI ` */ charPosAbsolute(params?: number[]): void;
  /** CSI a */ hPositionRelative(params?: number[]): void;
  /** CSI b */ repeatPrecedingCharacter(params?: number[]): void;
  /** CSI c */ sendDeviceAttributes(params?: number[], collect?: string): void;
  /** CSI d */ linePosAbsolute(params?: number[]): void;
  /** CSI e */ vPositionRelative(params?: number[]): void;
  /** CSI f */ hVPosition(params?: number[]): void;
  /** CSI g */ tabClear(params?: number[]): void;
  /** CSI h */ setMode(params?: number[], collect?: string): void;
  /** CSI l */ resetMode(params?: number[], collect?: string): void;
  /** CSI m */ charAttributes(params?: number[]): void;
  /** CSI n */ deviceStatus(params?: number[], collect?: string): void;
  /** CSI p */ softReset(params?: number[], collect?: string): void;
  /** CSI q */ setCursorStyle(params?: number[], collect?: string): void;
  /** CSI r */ setScrollRegion(params?: number[], collect?: string): void;
  /** CSI s */ saveCursor(params?: number[]): void;
  /** CSI u */ restoreCursor(params?: number[]): void;
  /** OSC 0
      OSC 2 */ setTitle(data: string): void;
  /** ESC E */ nextLine(): void;
  /** ESC = */ keypadApplicationMode(): void;
  /** ESC > */ keypadNumericMode(): void;
  /** ESC % G
      ESC % @ */ selectDefaultCharset(): void;
  /** ESC ( C
      ESC ) C
      ESC * C
      ESC + C
      ESC - C
      ESC . C
      ESC / C */ selectCharset(collectAndFlag: string): void;
  /** ESC D */ index(): void;
  /** ESC H */ tabSet(): void;
  /** ESC M */ reverseIndex(): void;
  /** ESC c */ reset(): void;
  /** ESC n
      ESC o
      ESC |
      ESC }
      ESC ~ */ setgLevel(level: number): void;
}

export interface ILinkMatcher {
  id: number;
  regex: RegExp;
  handler: LinkMatcherHandler;
  hoverTooltipCallback?: LinkMatcherHandler;
  hoverLeaveCallback?: () => void;
  matchIndex?: number;
  validationCallback?: LinkMatcherValidationCallback;
  priority?: number;
  willLinkActivate?: (event: MouseEvent, uri: string) => boolean;
}

export interface ILinkHoverEvent {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  cols: number;
  fg: number;
}

export interface ITerminal extends PublicTerminal, IElementAccessor, IBufferAccessor, ILinkifierAccessor {
  screenElement: HTMLElement;
  selectionManager: ISelectionManager;
  charMeasure: ICharMeasure;
  renderer: IRenderer;
  browser: IBrowser;
  writeBuffer: string[];
  cursorHidden: boolean;
  cursorState: number;
  options: ITerminalOptions;
  buffer: IBuffer;
  buffers: IBufferSet;
  isFocused: boolean;
  mouseHelper: IMouseHelper;
  viewport: IViewport;
  bracketedPasteMode: boolean;
  applicationCursor: boolean;

  /**
   * Emit the 'data' event and populate the given data.
   * @param data The data to populate in the event.
   */
  handler(data: string): void;
  scrollLines(disp: number, suppressScrollEvent?: boolean): void;
  cancel(ev: Event, force?: boolean): boolean | void;
  log(text: string): void;
  showCursor(): void;
}

export interface IBufferAccessor {
  buffer: IBuffer;
}

export interface IElementAccessor {
  element: HTMLElement;
}

export interface ILinkifierAccessor {
  linkifier: ILinkifier;
}

export interface IMouseHelper {
  getCoords(event: { clientX: number, clientY: number }, element: HTMLElement, charMeasure: ICharMeasure, colCount: number, rowCount: number, isSelection?: boolean): [number, number];
  getRawByteCoords(event: MouseEvent, element: HTMLElement, charMeasure: ICharMeasure, colCount: number, rowCount: number): { x: number, y: number };
}

export interface ICharMeasure {
  width: number;
  height: number;
  measure(options: ITerminalOptions): void;
}

// TODO: The options that are not in the public API should be reviewed
export interface ITerminalOptions extends IPublicTerminalOptions {
  [key: string]: any;
  cancelEvents?: boolean;
  convertEol?: boolean;
  debug?: boolean;
  handler?: (data: string) => void;
  screenKeys?: boolean;
  termName?: string;
  useFlowControl?: boolean;
}

export interface IBufferStringIteratorResult {
  range: {first: number, last: number};
  content: string;
}

export interface IBufferStringIterator {
  hasNext(): boolean;
  next(): IBufferStringIteratorResult;
}

export interface IBuffer {
  readonly lines: ICircularList<IBufferLine>;
  ydisp: number;
  ybase: number;
  y: number;
  x: number;
  tabs: any;
  scrollBottom: number;
  scrollTop: number;
  hasScrollback: boolean;
  savedY: number;
  savedX: number;
  savedCurAttr: number;
  isCursorInViewport: boolean;
  translateBufferLineToString(lineIndex: number, trimRight: boolean, startCol?: number, endCol?: number): string;
  getWrappedRangeForLine(y: number): { first: number, last: number };
  nextStop(x?: number): number;
  prevStop(x?: number): number;
  getBlankLine(attr: number, isWrapped?: boolean): IBufferLine;
  stringIndexToBufferIndex(lineIndex: number, stringIndex: number): number[];
  iterator(trimRight: boolean, startIndex?: number, endIndex?: number, startOverscan?: number, endOverscan?: number): IBufferStringIterator;
}

export interface IBufferSet extends IEventEmitter {
  alt: IBuffer;
  normal: IBuffer;
  active: IBuffer;

  activateNormalBuffer(): void;
  activateAltBuffer(fillAttr?: number): void;
}

export interface ISelectionManager {
  selectionText: string;
  selectionStart: [number, number];
  selectionEnd: [number, number];

  disable(): void;
  enable(): void;
  setSelection(row: number, col: number, length: number): void;
  isClickInSelection(event: MouseEvent): boolean;
  selectWordAtCursor(event: MouseEvent): void;
}

export interface ILinkifier extends IEventEmitter {
  attachToDom(mouseZoneManager: IMouseZoneManager): void;
  linkifyRows(start: number, end: number): void;
  registerLinkMatcher(regex: RegExp, handler: LinkMatcherHandler, options?: ILinkMatcherOptions): number;
  deregisterLinkMatcher(matcherId: number): boolean;
}

export interface ILinkMatcherOptions {
  /**
   * The index of the link from the regex.match(text) call. This defaults to 0
   * (for regular expressions without capture groups).
   */
  matchIndex?: number;
  /**
   * A callback that validates an individual link, returning true if valid and
   * false if invalid.
   */
  validationCallback?: LinkMatcherValidationCallback;
  /**
   * A callback that fires when the mouse hovers over a link.
   */
  tooltipCallback?: LinkMatcherHandler;
  /**
   * A callback that fires when the mouse leaves a link that was hovered.
   */
  leaveCallback?: () => void;
  /**
   * The priority of the link matcher, this defines the order in which the link
   * matcher is evaluated relative to others, from highest to lowest. The
   * default value is 0.
   */
  priority?: number;
  /**
   * A callback that fires when the mousedown and click events occur that
   * determines whether a link will be activated upon click. This enables
   * only activating a link when a certain modifier is held down, if not the
   * mouse event will continue propagation (eg. double click to select word).
   */
  willLinkActivate?: (event: MouseEvent, uri: string) => boolean;
}

export interface IBrowser {
  isNode: boolean;
  userAgent: string;
  platform: string;
  isFirefox: boolean;
  isMSIE: boolean;
  isMac: boolean;
  isIpad: boolean;
  isIphone: boolean;
  isMSWindows: boolean;
}

export interface ISoundManager {
  playBellSound(): void;
}

/**
 * Internal states of EscapeSequenceParser.
 */
export const enum ParserState {
  GROUND = 0,
  ESCAPE = 1,
  ESCAPE_INTERMEDIATE = 2,
  CSI_ENTRY = 3,
  CSI_PARAM = 4,
  CSI_INTERMEDIATE = 5,
  CSI_IGNORE = 6,
  SOS_PM_APC_STRING = 7,
  OSC_STRING = 8,
  DCS_ENTRY = 9,
  DCS_PARAM = 10,
  DCS_IGNORE = 11,
  DCS_INTERMEDIATE = 12,
  DCS_PASSTHROUGH = 13
}

/**
* Internal actions of EscapeSequenceParser.
*/
export const enum ParserAction {
  IGNORE = 0,
  ERROR = 1,
  PRINT = 2,
  EXECUTE = 3,
  OSC_START = 4,
  OSC_PUT = 5,
  OSC_END = 6,
  CSI_DISPATCH = 7,
  PARAM = 8,
  COLLECT = 9,
  ESC_DISPATCH = 10,
  CLEAR = 11,
  DCS_HOOK = 12,
  DCS_PUT = 13,
  DCS_UNHOOK = 14
}

/**
 * Internal state of EscapeSequenceParser.
 * Used as argument of the error handler to allow
 * introspection at runtime on parse errors.
 * Return it with altered values to recover from
 * faulty states (not yet supported).
 * Set `abort` to `true` to abort the current parsing.
 */
export interface IParsingState {
  // position in parse string
  position: number;
  // actual character code
  code: number;
  // current parser state
  currentState: ParserState;
  // print buffer start index (-1 for not set)
  print: number;
  // dcs buffer start index (-1 for not set)
  dcs: number;
  // osc string buffer
  osc: string;
  // collect buffer with intermediate characters
  collect: string;
  // params buffer
  params: number[];
  // should abort (default: false)
  abort: boolean;
}

/**
* DCS handler signature for EscapeSequenceParser.
* EscapeSequenceParser handles DCS commands via separate
* subparsers that get hook/unhooked and can handle
* arbitrary amount of data.
*
* On entering a DSC sequence `hook` is called by
* `EscapeSequenceParser`. Use it to initialize or reset
* states needed to handle the current DCS sequence.
* Note: A DCS parser is only instantiated once, therefore
* you cannot rely on the ctor to reinitialize state.
*
* EscapeSequenceParser will call `put` several times if the
* parsed data got split, therefore you might have to collect
* `data` until `unhook` is called.
* Note: `data` is borrowed, if you cannot process the data
* in chunks you have to copy it, doing otherwise will lead to
* data losses or corruption.
*
* `unhook` marks the end of the current DCS sequence.
*/
export interface IDcsHandler {
  hook(collect: string, params: number[], flag: number): void;
  put(data: Uint32Array, start: number, end: number): void;
  unhook(): void;
}

/**
* EscapeSequenceParser interface.
*/
export interface IEscapeSequenceParser extends IDisposable {
  /**
   * Reset the parser to its initial state (handlers are kept).
   */
  reset(): void;

  /**
   * Parse string `data`.
   * @param data The data to parse.
   */
  parse(data: Uint32Array, length: number): void;

  setPrintHandler(callback: (data: Uint32Array, start: number, end: number) => void): void;
  clearPrintHandler(): void;

  setExecuteHandler(flag: string, callback: () => void): void;
  clearExecuteHandler(flag: string): void;
  setExecuteHandlerFallback(callback: (code: number) => void): void;

  setCsiHandler(flag: string, callback: (params: number[], collect: string) => void): void;
  clearCsiHandler(flag: string): void;
  setCsiHandlerFallback(callback: (collect: string, params: number[], flag: number) => void): void;
  addCsiHandler(flag: string, callback: (params: number[], collect: string) => boolean): IDisposable;
  addOscHandler(ident: number, callback: (data: string) => boolean): IDisposable;

  setEscHandler(collectAndFlag: string, callback: () => void): void;
  clearEscHandler(collectAndFlag: string): void;
  setEscHandlerFallback(callback: (collect: string, flag: number) => void): void;

  setOscHandler(ident: number, callback: (data: string) => void): void;
  clearOscHandler(ident: number): void;
  setOscHandlerFallback(callback: (identifier: number, data: string) => void): void;

  setDcsHandler(collectAndFlag: string, handler: IDcsHandler): void;
  clearDcsHandler(collectAndFlag: string): void;
  setDcsHandlerFallback(handler: IDcsHandler): void;

  setErrorHandler(callback: (state: IParsingState) => IParsingState): void;
  clearErrorHandler(): void;
}

/**
 * Interface for a line in the terminal buffer.
 */
export interface IBufferLine {
  length: number;
  isWrapped: boolean;
  get(index: number): CharData;
  set(index: number, value: CharData): void;
  insertCells(pos: number, n: number, ch: CharData): void;
  deleteCells(pos: number, n: number, fill: CharData): void;
  replaceCells(start: number, end: number, fill: CharData): void;
  resize(cols: number, fill: CharData): void;
  fill(fillCharData: CharData): void;
  copyFrom(line: IBufferLine): void;
  clone(): IBufferLine;
  getTrimmedLength(): number;
  translateToString(trimRight?: boolean, startCol?: number, endCol?: number): string;
}
