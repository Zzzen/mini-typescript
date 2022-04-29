import { Statement, Node, Expression } from './types'
export function emit(statements: Statement[]) {
    return statements.map(emitStatement).join(";\n")
}
function emitStatement(statement: Statement): string {
    switch (statement.kind) {
        case Node.ExpressionStatement:
            return emitExpression(statement.expr)
        case Node.Var:
            const typestring = statement.typename ? ": " + statement.name : ""
            return `var ${statement.name.text}${typestring} = ${emitExpression(statement.init)}`
        case Node.TypeAlias:
            return `type ${statement.name.text} = ${statement.typename.text}`
        case Node.FunctionDeclaration:
            const typeParameters = statement.typeParameters?.length ? '<' + statement.typeParameters.map(x => x.text).join(', ') + '>' : ''
            const parameters = statement.parameters.map(x => x.name.text + (x.type ? ': ' + x.type.text : '')).join(', ')
            const type = statement.type ? ': ' + statement.type.text : ''
            return `function ${statement.name.text} ${typeParameters}(${parameters})${type}`
        case Node.CallExpression:
            return emitExpression(statement)
        case Node.EmptyStatement:
            return ''
    }
}
function emitExpression(expression: Expression): string {
    switch (expression.kind) {
        case Node.Identifier:
            return expression.text
        case Node.Literal:
            return ""+expression.value
        case Node.Assignment:
            return `${expression.name.text} = ${emitExpression(expression.value)}`
        case Node.CallExpression:
            return `${expression.expression.text}(${expression.arguments.map(emitExpression).join(', ')})`
    }
}

