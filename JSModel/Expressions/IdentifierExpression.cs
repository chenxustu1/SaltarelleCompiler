using System;

namespace Saltarelle.Compiler.JSModel.Expressions {
    [Serializable]
    public class IdentifierExpression : Expression {
        public string Name { get; private set; }

        public override int Precedence { get { return ExpressionPrecedence.Terminal; } }

        public IdentifierExpression(string name) {
            if (name == null) throw new ArgumentNullException("name");
            if (!name.IsValidJavaScriptIdentifier()) throw new ArgumentException("name");
            Name = name;
        }

        public override string ToString() {
            return Name;
        }

        [System.Diagnostics.DebuggerStepThrough]
        public override TReturn Accept<TReturn, TData>(IExpressionVisitor<TReturn, TData> visitor, TData data) {
            return visitor.Visit(this, data);
        }
    }
}
