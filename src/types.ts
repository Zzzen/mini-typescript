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
}
export type Error = {
    pos: number
    message: string
}
export interface ParameterDeclaration {
    readonly name: Identifier;                  // Declared parameter name.
    readonly type?: Identifier;
}
export interface Location {
    pos: number
}
export type Expression = Identifier | Literal | Assignment
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
}
export type Statement = ExpressionStatement | Var | TypeAlias | FunctionDeclaration
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
export type Declaration = Var | TypeAlias // plus others, like function
export type Symbol = { 
    valueDeclaration: Declaration | undefined
    declarations: Declaration[] 
}
export type Table = Map<string, Symbol>
export type Module = {
    locals: Table
    statements: Statement[]
}
export type Type = { id: string }