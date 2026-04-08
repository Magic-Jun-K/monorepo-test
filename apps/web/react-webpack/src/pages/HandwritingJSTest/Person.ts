export interface PersonInstance {
  name: string;
  age: number;
}

class PersonClass implements PersonInstance {
  constructor(
    public name: string,
    public age: number,
  ) {
    if (!(this instanceof PersonClass)) {
      throw new Error('Must be called with new');
    }
  }
}

export function Person(name: string, age: number): PersonInstance {
  return new PersonClass(name, age);
}
