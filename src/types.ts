export enum Token {
    Function,
    Var,
    Type,
    Return,
    Equals,
    Literal,
    Identifier,
    Newline,
    Semicolon,
    Colon,
    LessThanToken,
    GreaterThanToken,
    CommaToken,
    OpenParenToken,
    CloseParenToken,
    Whitespace,
    Unknown,
    BOF,
    EOF,
}
export type Lexer = {
    scan(): void
    token(): Token
    pos(): number
    text(): string
}
export enum Node {
    Identifier,
    Literal,
    Assignment,
    ExpressionStatement,
    Var,
    TypeAlias,
    FunctionDeclaration,
    Parameter,
    CallExpression,
    EmptyStatement,
}
export type Error = {
    pos: number
    message: string
}
export interface ParameterDeclaration {
    readonly kind: Node.Parameter;
    readonly name: Identifier;                  // Declared parameter name.
    readonly type?: Identifier;
}
export interface Location {
    pos: number
}
export type Expression = Identifier | Literal | Assignment | CallExpression
export type Identifier = Location & {
    kind: Node.Identifier
    text: string
}
export type Literal = Location & {
    kind: Node.Literal
    value: number
}
export type Assignment = Location & {
    kind: Node.Assignment
    name: Identifier
    value: Expression
}
export type FunctionDeclaration = Location & {
    kind: Node.FunctionDeclaration
    name: Identifier
    typeParameters?: ReadonlyArray<Identifier>
    parameters: ReadonlyArray<ParameterDeclaration>
    type?: Identifier
    locals?: Table
}
export type CallExpression = Location & {
    kind: Node.CallExpression
    expression: Identifier
    typeArguments?: ReadonlyArray<Identifier>
    arguments: ReadonlyArray<Expression>
}
export type EmptyStatement = Location & {
    kind: Node.EmptyStatement
}
export type Statement = ExpressionStatement | Var | TypeAlias | FunctionDeclaration | EmptyStatement | CallExpression
export type ExpressionStatement = Location & {
    kind: Node.ExpressionStatement
    expr: Expression
}
export type Var = Location & {
    kind: Node.Var
    name: Identifier
    typename?: Identifier | undefined
    init: Expression
}
export type TypeAlias = Location & {
    kind: Node.TypeAlias
    name: Identifier
    typename: Identifier
}
// Identifier should have been TypeParameter
export type Declaration = Var | TypeAlias | FunctionDeclaration | ParameterDeclaration | Identifier // plus others, like function
export type Symbol = { 
    valueDeclaration: Declaration | undefined
    declarations: Declaration[] 
}
export type Table = Map<string, Symbol>
export type Module = {
    locals: Table
    statements: Statement[]
}
export enum TypeFlags {
    Any             = 1 << 0,
    Unknown         = 1 << 1,
    String          = 1 << 2,
    Number          = 1 << 3,

    TypeParameter   = 1 << 18,  // Type parameter

    Intrinsic = Any | Unknown | String | Number,
}
export enum ObjectFlags {

}
export type Type = {
    id: number;
    flags: TypeFlags;
    intrinsicName?: string;
    symbol?: Symbol;
}
export interface Signature {
    declaration?: FunctionDeclaration;
    typeParameters?: readonly Type[];   // Type parameters (undefined if non-generic)
    parameters: readonly Symbol[];               // Parameters
    resolvedReturnType?: Type;          // Lazily set by `getReturnTypeOfSignature`.
}

