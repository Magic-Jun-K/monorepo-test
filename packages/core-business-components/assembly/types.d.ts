// AssemblyScript 类型声明
// 为 TypeScript 编译器提供 AssemblyScript 特有类型的声明

// 基本整数类型
type i8 = number;
type i16 = number;
type i32 = number;
type i64 = bigint;

type u8 = number;
type u16 = number;
type u32 = number;
type u64 = bigint;

// 基本浮点类型
type f32 = number;
type f64 = number;

// 其他 AssemblyScript 特有类型
type bool = boolean;

// AssemblyScript 全局函数声明
declare function isNaN(value: f32 | f64): bool;
declare function isFinite(value: f32 | f64): bool;

// 类型转换函数
declare function i8(value: any): i8;
declare function i16(value: any): i16;
declare function i32(value: any): i32;
declare function i64(value: any): i64;

declare function u8(value: any): u8;
declare function u16(value: any): u16;
declare function u32(value: any): u32;
declare function u64(value: any): u64;

declare function f32(value: any): f32;
declare function f64(value: any): f64;