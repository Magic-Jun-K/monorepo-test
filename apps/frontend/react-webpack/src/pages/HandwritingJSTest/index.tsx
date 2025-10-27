import { useEffect } from 'react';

import './myCall';
import './myApply';
import './myBind';

export default () => {
  // 测试 myCall 函数
  useEffect(() => {
    console.log('=== 测试 myCall 函数 ===');

    // 测试1: 基本用法
    const obj1 = { name: 'Alice' };
    function greet(this: { name: string }, greeting: string) {
      return `${greeting}, ${this.name}!`;
    }
    console.log('测试1 - 基本用法:', greet.myCall(obj1, 'Hello'));

    // 测试2: 传入多个参数
    const obj2 = { multiplier: 5 };
    function multiply(this: { multiplier: number }, a: number, b: number) {
      return a * b * this.multiplier;
    }
    console.log('测试2 - 多参数:', multiply.myCall(obj2, 3, 4));

    // 测试3: null 上下文
    function getValue(this: any) {
      return this.value || 'default';
    }

    // 创建一个带有 value 属性的对象来代替直接设置 globalThis.value
    const globalObj = { value: 'globalValue' };
    console.log('测试3 - null上下文:', getValue.myCall(globalObj));
  }, []);

  // 测试 myApply 函数
  useEffect(() => {
    console.log('=== 测试 myApply 函数 ===');

    // 测试1: 基本用法
    const obj3 = { prefix: 'Result:' };
    function formatResult(this: { prefix: string }, ...numbers: number[]) {
      const sum = numbers.reduce((acc, num) => acc + num, 0);
      return `${this.prefix} ${sum}`;
    }
    console.log('测试1 - 基本用法:', formatResult.myApply(obj3, [1, 2, 3, 4]));

    // 测试2: 无参数
    const obj4 = { defaultValue: 'empty' };
    function getDefaultValue(this: { defaultValue: string }) {
      return this.defaultValue;
    }
    console.log('测试2 - 无参数:', getDefaultValue.myApply(obj4));
  }, []);

  // 测试 myBind 函数
  useEffect(() => {
    console.log('=== 测试 myBind 函数 ===');

    // 测试1: 基本绑定
    const obj5 = { greeting: 'Hi' };
    function sayGreeting(this: { greeting: string }, name: string) {
      return `${this.greeting}, ${name}!`;
    }
    const boundFunc = sayGreeting.myBind(obj5);
    console.log('测试1 - 基本绑定:', boundFunc('Bob'));

    // 测试2: 预设参数
    const obj6 = { separator: '-' };
    function joinWithSeparator(this: { separator: string }, a: string, b: string) {
      return a + this.separator + b;
    }
    const boundFuncWithArgs = joinWithSeparator.myBind(obj6, 'first');
    console.log('测试2 - 预设参数:', boundFuncWithArgs('second'));

    // 测试3: 作为构造函数使用
    interface PersonInstance {
      name: string;
      age: number;
    }

    // 修正 Person 函数的类型
    function Person(this: PersonInstance, name: string, age: number) {
      if (!(this instanceof Person)) {
        throw new Error('Must be called with new');
      }
      this.name = name;
      this.age = age;
    }

    // 使用类型断言来解决类型不匹配问题
    const BoundPerson = Person.myBind({} as PersonInstance);
    const person = new BoundPerson('Charlie', 30);
    console.log('测试3 - 作为构造函数:', person);
  }, []);

  return <div>手写JS测试 - 请打开控制台查看测试结果</div>;
};