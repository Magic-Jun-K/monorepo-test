export interface PersonInstance {
  name: string;
  age: number;
}

export function Person(this: PersonInstance, name: string, age: number) {
  if (!(this instanceof Person)) {
    throw new Error('Must be called with new');
  }
  this.name = name;
  this.age = age;
}
