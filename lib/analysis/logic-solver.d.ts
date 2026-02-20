declare module "logic-solver" {
  type Term = string | number;
  type FormulaOrTerm = Formula | Term;

  class Formula {}

  class Solver {
    require(...formulas: FormulaOrTerm[]): void;
    forbid(...formulas: FormulaOrTerm[]): void;
    solve(): Solution | null;
    solveAssuming(formula: FormulaOrTerm): Solution | null;
  }

  class Solution {
    getMap(): Record<string, boolean>;
    getTrueVars(): string[];
    evaluate(formula: FormulaOrTerm): boolean | number;
    getFormula(): Formula;
  }

  const TRUE: string;
  const FALSE: string;

  function not(operand: FormulaOrTerm): Term | Formula;
  function or(...operands: FormulaOrTerm[]): Formula;
  function and(...operands: FormulaOrTerm[]): Formula;
  function implies(A: FormulaOrTerm, B: FormulaOrTerm): Formula;
  function exactlyOne(...operands: FormulaOrTerm[]): Formula;
  function atMostOne(...operands: FormulaOrTerm[]): Formula;
}
