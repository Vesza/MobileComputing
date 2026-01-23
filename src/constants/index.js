// Sammelt Exporte aus mehreren Dateien an einer Stelle.
// Dadurch kann an anderen Stellen einfach aus "../constants" importiert werden,
// ohne die einzelnen Dateien (layout/colors/typography/ui) direkt anzugeben.
export * from "./layout";
export * from "./colors";
export * from "./typography";
export * from "./ui";
