import type { LanguageConfig } from '../types/symbol';

export const languageConfigs: Record<string, LanguageConfig> = {
  javascript: {
    name: 'JavaScript',
    extension: '.js',
    example: `// JavaScript Example
let userName = "Alice";
const PI = 3.14159;
var count = 0;

function calculateArea(radius) {
  let area = PI * radius * radius;
  return area;
}

class Circle {
  constructor(radius) {
    this.radius = radius;
  }
  
  getArea() {
    return PI * this.radius * this.radius;
  }
}`,
    keywords: ['let', 'const', 'var', 'function', 'class', 'import', 'export']
  },
  
  python: {
    name: 'Python',
    extension: '.py',
    example: `# Python Example
import math

user_name = "Alice"
PI = 3.14159
count = 0

def calculate_area(radius):
    area = PI * radius * radius
    return area

class Circle:
    def __init__(self, radius):
        self.radius = radius
    
    def get_area(self):
        return PI * self.radius * self.radius

# Global variable
global_var = "Hello World"`,
    keywords: ['def', 'class', 'import', 'from', 'global', 'nonlocal']
  },
  
  java: {
    name: 'Java',
    extension: '.java',
    example: `// Java Example
import java.util.*;

public class Calculator {
    private static final double PI = 3.14159;
    private String userName = "Alice";
    private int count = 0;
    
    public double calculateArea(double radius) {
        double area = PI * radius * radius;
        return area;
    }
    
    public static void main(String[] args) {
        Calculator calc = new Calculator();
        Scanner scanner = new Scanner(System.in);
        
        System.out.println("Hello, " + calc.userName);
    }
}`,
    keywords: ['public', 'private', 'protected', 'static', 'final', 'class', 'import', 'package']
  },
  
  c: {
    name: 'C',
    extension: '.c',
    example: `// C Example
#include <stdio.h>
#include <math.h>

#define PI 3.14159

char userName[] = "Alice";
int count = 0;

double calculateArea(double radius) {
    double area = PI * radius * radius;
    return area;
}

int main() {
    double radius = 5.0;
    double area = calculateArea(radius);
    
    printf("Hello, %s\\n", userName);
    printf("Area: %.2f\\n", area);
    
    return 0;
}`,
    keywords: ['#include', '#define', 'int', 'double', 'float', 'char', 'void', 'struct', 'typedef']
  },
  
  cpp: {
    name: 'C++',
    extension: '.cpp',
    example: `// C++ Example
#include <iostream>
#include <string>

const double PI = 3.14159;

class Circle {
private:
    double radius;
    std::string name;
    
public:
    Circle(double r, std::string n) : radius(r), name(n) {}
    
    double calculateArea() {
        return PI * radius * radius;
    }
    
    void display() {
        std::cout << "Circle " << name << " has area: " 
                  << calculateArea() << std::endl;
    }
};

int main() {
    Circle myCircle(5.0, "MyCircle");
    myCircle.display();
    return 0;
}`,
    keywords: ['#include', 'class', 'public', 'private', 'protected', 'namespace', 'using', 'template']
  },
  
  csharp: {
    name: 'C#',
    extension: '.cs',
    example: `// C# Example
using System;

namespace Calculator
{
    public class Circle
    {
        private const double PI = 3.14159;
        private string userName = "Alice";
        private int count = 0;
        
        public double CalculateArea(double radius)
        {
            double area = PI * radius * radius;
            return area;
        }
        
        public static void Main(string[] args)
        {
            Circle circle = new Circle();
            double area = circle.CalculateArea(5.0);
            
            Console.WriteLine($"Hello, {circle.userName}");
            Console.WriteLine($"Area: {area}");
        }
    }
}`,
    keywords: ['using', 'namespace', 'class', 'public', 'private', 'protected', 'static', 'const']
  },
  
  go: {
    name: 'Go',
    extension: '.go',
    example: `// Go Example
package main

import (
    "fmt"
    "math"
)

const PI = 3.14159

var userName string = "Alice"
var count int = 0

func calculateArea(radius float64) float64 {
    area := PI * radius * radius
    return area
}

type Circle struct {
    radius float64
    name   string
}

func (c Circle) getArea() float64 {
    return PI * c.radius * c.radius
}

func main() {
    circle := Circle{radius: 5.0, name: "MyCircle"}
    area := circle.getArea()
    
    fmt.Printf("Hello, %s\\n", userName)
    fmt.Printf("Area: %.2f\\n", area)
}`,
    keywords: ['package', 'import', 'func', 'var', 'const', 'type', 'struct', 'interface']
  },
  
  rust: {
    name: 'Rust',
    extension: '.rs',
    example: `// Rust Example
use std::f64::consts::PI;

static USER_NAME: &str = "Alice";
static mut COUNT: i32 = 0;

fn calculate_area(radius: f64) -> f64 {
    let area = PI * radius * radius;
    area
}

struct Circle {
    radius: f64,
    name: String,
}

impl Circle {
    fn new(radius: f64, name: String) -> Circle {
        Circle { radius, name }
    }
    
    fn get_area(&self) -> f64 {
        PI * self.radius * self.radius
    }
}

fn main() {
    let circle = Circle::new(5.0, "MyCircle".to_string());
    let area = circle.get_area();
    
    println!("Hello, {}", USER_NAME);
    println!("Area: {:.2}", area);
}`,
    keywords: ['use', 'fn', 'let', 'mut', 'const', 'static', 'struct', 'impl', 'trait', 'enum']
  }
};