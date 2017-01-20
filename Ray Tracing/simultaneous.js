var expr1 = algebra.parse("1/4 * x + 5/4");
var expr2 = algebra.parse("3 * y - 12/5");

var eq = new Equation(expr1, expr2);

console.log(eq.toString());

var xAnswer = eq.solveFor("x");
var yAnswer = eq.solveFor("y");

console.log("x = " + xAnswer.toString());
console.log("y = " + yAnswer.toString());
