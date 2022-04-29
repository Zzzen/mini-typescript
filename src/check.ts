import { Module, Statement, Type, Node, Expression, Identifier, TypeAlias, TypeFlags, ObjectFlags, CallExpression, FunctionDeclaration, Signature } from './types'
import { error } from './error'
import { resolve } from './bind'

let typeCount = 0;

const stringType: Type = createIntrinsicType(TypeFlags.String, 'string');
const numberType: Type = createIntrinsicType(TypeFlags.Number, 'number');
const errorType: Type = createIntrinsicType(TypeFlags.Any, 'error');

function typeToString(type: Type) {
    return type.intrinsicName || 'unknown';
}
export function check(module: Module) {
    return module.statements.map(checkStatement)

    function checkStatement(statement: Statement): Type | undefined {
        switch (statement.kind) {
            case Node.ExpressionStatement:
                return checkExpression(statement.expr)
            case Node.Var:
                const i = checkExpression(statement.init)
                if (!statement.typename) {
                    return i
                }
                const t = checkType(statement.typename)
                if (t !== i && t !== errorType)
                    error(statement.init.pos, `Cannot assign initialiser of type '${typeToString(i)}' to variable with declared type '${typeToString(t)}'.`)
                return t
            case Node.TypeAlias:
                return checkType(statement.typename)
        }
    }
    function checkExpression(expression: Expression): Type {
        switch (expression.kind) {
            case Node.Identifier:
                const symbol = resolve(module.locals, expression.text, Node.Var)
                if (symbol) {
                    return checkStatement(symbol.valueDeclaration! as Statement)!
                }
                error(expression.pos, "Could not resolve " + expression.text)
                return errorType
            case Node.Literal:
                return numberType
            case Node.Assignment:
                const v = checkExpression(expression.value)
                const t = checkExpression(expression.name)
                if (t !== v)
                    error(expression.value.pos, `Cannot assign value of type '${typeToString(v)}' to variable of type '${typeToString(t)}'.`)
                return t
            case Node.CallExpression:
                return checkCallExpression(expression);
        }
    }

    function checkCallExpression(callExpression: CallExpression): Type {
        const caller = callExpression.expression;
        const symbol = resolve(module.locals, caller.text, Node.FunctionDeclaration);
        if (!symbol) {
            error(caller.pos, "Could not resolve " + caller.text)
            return errorType
        }

        const declaration = symbol.valueDeclaration as FunctionDeclaration;
        if (!declaration) {
            error(caller.pos, "Could not find declaration " + caller.text)
            return errorType
        }

        const signature = getSignatureFromDeclaration(declaration);

    }

    function checkType(name: Identifier): Type {
        switch (name.text) {
            case "string":
                return stringType
            case "number":
                return numberType
            default:
                const symbol = resolve(module.locals, name.text, Node.TypeAlias)
                if (symbol) {
                    return checkType((symbol.declarations.find(d => d.kind === Node.TypeAlias) as TypeAlias).typename)
                }
                error(name.pos, "Could not resolve type " + name.text)
                return errorType
        }
    }


    function getSignatureFromDeclaration(declaration: FunctionDeclaration) {
        const typeParameters = getTypeParametersFromDeclaration(declaration);
        const parameters = declaration.parameters.map(p => declaration.locals?.get(p.name.text)!);

        const returnTypeText = declaration.type ? declaration.type.text : undefined;

        const returnType = returnTypeText && ['string', 'number'].includes(returnTypeText) ?
            checkType(declaration.type!) :
            returnTypeText ?
                typeParameters.find(x => x.intrinsicName === returnTypeText) :
                undefined;

        const signature: Signature = {
            declaration,
            typeParameters,
            parameters,
            resolvedReturnType: returnType,
        }

        return signature;
    }

    function getTypeParametersFromDeclaration(declaration: FunctionDeclaration): Type[] {
        return declaration.typeParameters ? declaration.typeParameters.map(t => {
            const type = createIntrinsicType(TypeFlags.TypeParameter, t.text)
            type.symbol = declaration.locals?.get(t.text)
            return type;
        }) : [];
    }

    function createIntrinsicType(kind: TypeFlags, intrinsicName: string): Type {
        const type: Type = {
            id: ++typeCount,
            flags: kind,
        };
        type.intrinsicName = intrinsicName;
        return type;
    }

}
