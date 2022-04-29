import { FunctionDeclaration, Module, Node, Statement, Table } from './types'
import { error } from './error'
export function bind(m: Module) {
    for (const statement of m.statements) {
        bindStatement(m.locals, statement)
    }

    function bindStatement(locals: Table, statement: Statement) {
        if (statement.kind === Node.Var || statement.kind === Node.TypeAlias || statement.kind === Node.FunctionDeclaration) {
            const symbol = locals.get(statement.name.text)
            if (symbol) {
                const other = symbol.declarations.find(d => d.kind === statement.kind)
                if (other) {
                    error(statement.pos, `Cannot redeclare ${statement.name.text}; first declared at ${other.pos}`)
                }
                else {
                    symbol.declarations.push(statement)
                    if (statement.kind === Node.Var) {
                        symbol.valueDeclaration = statement
                    }
                }
            }
            else {
                locals.set(statement.name.text, {
                    declarations: [statement], 
                    valueDeclaration: statement.kind === Node.Var ? statement : undefined
                })
            }
        }

        if (statement.kind === Node.FunctionDeclaration) {
            bindFunctionDeclaration(statement)
        }
    }
}

function bindFunctionDeclaration(declaration: FunctionDeclaration) {
    const locals: Table = new Map()
    for(const parameter of declaration.parameters) {
        locals.set(parameter.name.text, {
            declarations: [parameter],
            valueDeclaration: parameter
        })
    }
    for (const typeParameters of declaration.typeParameters || []) {
        locals.set(typeParameters.text, {
            declarations: [typeParameters],
            valueDeclaration: typeParameters
        })
    }

    declaration.locals = locals;
}

export function resolve(locals: Table, name: string, meaning: Node.Var | Node.TypeAlias | Node.FunctionDeclaration) {
    const symbol = locals.get(name)
    if (symbol?.declarations.some(d => d.kind === meaning)) {
        return symbol
    }
}
