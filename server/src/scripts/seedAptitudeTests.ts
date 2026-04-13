import mongoose from 'mongoose';
import dotenv from 'dotenv';
import AptitudeTest from '../models/AptitudeTest.model';

dotenv.config();

const companies = ['TCS', 'Infosys', 'Wipro', 'Cognizant', 'Accenture', 'Google', 'Microsoft', 'Amazon'];

const aptitudeQuestions = {
  TCS: [
    {
      questionId: 'tcs_q1',
      question: 'If the ratio of ages of A and B is 3:4 and the sum of their ages is 56, what is the age of A?',
      options: ['21', '24', '28', '32'],
      correctAnswer: 1,
      explanation: 'Let the ages be 3x and 4x. Then 3x + 4x = 56, so 7x = 56, x = 8. Age of A = 3x = 24.',
      difficulty: 'easy',
      topic: 'Ratios and Proportions',
    },
    {
      questionId: 'tcs_q2',
      question: 'A train 150m long passes a pole in 15 seconds. What is the speed of the train in km/hr?',
      options: ['30 km/hr', '36 km/hr', '40 km/hr', '45 km/hr'],
      correctAnswer: 1,
      explanation: 'Speed = Distance/Time = 150/15 = 10 m/s = 10 × 18/5 = 36 km/hr.',
      difficulty: 'easy',
      topic: 'Time and Distance',
    },
    {
      questionId: 'tcs_q3',
      question: 'The average of 5 numbers is 25. If one number is excluded, the average becomes 20. What is the excluded number?',
      options: ['35', '40', '45', '50'],
      correctAnswer: 2,
      explanation: 'Sum of 5 numbers = 5 × 25 = 125. Sum of 4 numbers = 4 × 20 = 80. Excluded number = 125 - 80 = 45.',
      difficulty: 'medium',
      topic: 'Average',
    },
    {
      questionId: 'tcs_q4',
      question: 'A shopkeeper sells an article for Rs. 720 at a loss of 20%. What is the cost price?',
      options: ['Rs. 800', 'Rs. 850', 'Rs. 900', 'Rs. 950'],
      correctAnswer: 2,
      explanation: 'If SP = 80% of CP, then CP = SP/0.8 = 720/0.8 = Rs. 900.',
      difficulty: 'medium',
      topic: 'Profit and Loss',
    },
    {
      questionId: 'tcs_q5',
      question: 'In a code language, COMPUTER is written as RFUVQNPC. How is MEDICINE written in that code?',
      options: ['EOJDJEFM', 'EOJDJEFN', 'FOJDJEFM', 'EOJDJEGM'],
      correctAnswer: 0,
      explanation: 'The letters are reversed in groups of two.',
      difficulty: 'hard',
      topic: 'Coding-Decoding',
    },
  ],
  Infosys: [
    {
      questionId: 'infy_q1',
      question: 'What is the next number in the series: 2, 6, 12, 20, 30, ?',
      options: ['38', '40', '42', '44'],
      correctAnswer: 2,
      explanation: 'The pattern is n(n+1): 1×2=2, 2×3=6, 3×4=12, 4×5=20, 5×6=30, 6×7=42.',
      difficulty: 'easy',
      topic: 'Number Series',
    },
    {
      questionId: 'infy_q2',
      question: 'If 20 men can complete a work in 30 days, how many days will 25 men take?',
      options: ['20 days', '22 days', '24 days', '26 days'],
      correctAnswer: 2,
      explanation: 'Using M1×D1 = M2×D2: 20×30 = 25×D2, so D2 = 600/25 = 24 days.',
      difficulty: 'easy',
      topic: 'Time and Work',
    },
    {
      questionId: 'infy_q3',
      question: 'The simple interest on a sum for 3 years at 10% per annum is Rs. 600. What is the principal?',
      options: ['Rs. 1500', 'Rs. 1800', 'Rs. 2000', 'Rs. 2200'],
      correctAnswer: 2,
      explanation: 'SI = P×R×T/100, so 600 = P×10×3/100, P = 600×100/30 = Rs. 2000.',
      difficulty: 'medium',
      topic: 'Simple Interest',
    },
    {
      questionId: 'infy_q4',
      question: 'A bag contains 4 red, 5 blue, and 6 green balls. What is the probability of drawing a blue ball?',
      options: ['1/3', '5/15', '1/4', '5/12'],
      correctAnswer: 0,
      explanation: 'Total balls = 15, Blue balls = 5. Probability = 5/15 = 1/3.',
      difficulty: 'medium',
      topic: 'Probability',
    },
    {
      questionId: 'infy_q5',
      question: 'Find the odd one out: 3, 5, 11, 14, 17, 21',
      options: ['3', '11', '14', '21'],
      correctAnswer: 2,
      explanation: 'All except 14 are odd numbers. 14 is the only even number.',
      difficulty: 'easy',
      topic: 'Odd One Out',
    },
  ],
  Wipro: [
    {
      questionId: 'wipro_q1',
      question: 'What percentage of 120 is 30?',
      options: ['20%', '25%', '30%', '35%'],
      correctAnswer: 1,
      explanation: '(30/120) × 100 = 25%.',
      difficulty: 'easy',
      topic: 'Percentage',
    },
    {
      questionId: 'wipro_q2',
      question: 'The HCF of two numbers is 12 and their LCM is 180. If one number is 36, find the other.',
      options: ['48', '54', '60', '72'],
      correctAnswer: 2,
      explanation: 'Product of numbers = HCF × LCM. So 36 × x = 12 × 180, x = 60.',
      difficulty: 'medium',
      topic: 'HCF and LCM',
    },
    {
      questionId: 'wipro_q3',
      question: 'A can complete a work in 10 days and B in 15 days. How long will they take working together?',
      options: ['5 days', '6 days', '7 days', '8 days'],
      correctAnswer: 1,
      explanation: 'A\'s 1 day work = 1/10, B\'s 1 day work = 1/15. Together = 1/10 + 1/15 = 5/30 = 1/6. So 6 days.',
      difficulty: 'medium',
      topic: 'Time and Work',
    },
    {
      questionId: 'wipro_q4',
      question: 'The area of a square is 576 sq cm. What is the perimeter?',
      options: ['72 cm', '84 cm', '96 cm', '108 cm'],
      correctAnswer: 2,
      explanation: 'Side = √576 = 24 cm. Perimeter = 4 × 24 = 96 cm.',
      difficulty: 'easy',
      topic: 'Mensuration',
    },
    {
      questionId: 'wipro_q5',
      question: 'If LOGIC is coded as 40 and REASON is coded as 62, what is the code for ANALYSIS?',
      options: ['85', '90', '95', '100'],
      correctAnswer: 1,
      explanation: 'Sum of position of letters: A=1, B=2, etc. ANALYSIS = 1+14+1+12+25+19+9+19 = 100.',
      difficulty: 'hard',
      topic: 'Coding-Decoding',
    },
  ],
  Cognizant: [
    {
      questionId: 'cogni_q1',
      question: 'A man buys an article for Rs. 450 and sells it for Rs. 540. What is the profit percentage?',
      options: ['15%', '18%', '20%', '25%'],
      correctAnswer: 2,
      explanation: 'Profit = 540 - 450 = 90. Profit% = (90/450) × 100 = 20%.',
      difficulty: 'easy',
      topic: 'Profit and Loss',
    },
    {
      questionId: 'cogni_q2',
      question: 'The difference between compound interest and simple interest on Rs. 5000 for 2 years at 10% is?',
      options: ['Rs. 25', 'Rs. 50', 'Rs. 75', 'Rs. 100'],
      correctAnswer: 1,
      explanation: 'Difference = P(r/100)² = 5000 × (10/100)² = 5000 × 0.01 = Rs. 50.',
      difficulty: 'hard',
      topic: 'Compound Interest',
    },
    {
      questionId: 'cogni_q3',
      question: 'A boat goes 12 km upstream in 3 hours and 18 km downstream in 3 hours. Find the speed of the boat in still water.',
      options: ['4 km/hr', '5 km/hr', '6 km/hr', '7 km/hr'],
      correctAnswer: 1,
      explanation: 'Upstream speed = 12/3 = 4 km/hr. Downstream speed = 18/3 = 6 km/hr. Boat speed = (4+6)/2 = 5 km/hr.',
      difficulty: 'medium',
      topic: 'Boats and Streams',
    },
    {
      questionId: 'cogni_q4',
      question: 'In how many ways can 5 people be arranged in a row?',
      options: ['100', '120', '125', '150'],
      correctAnswer: 1,
      explanation: '5! = 5 × 4 × 3 × 2 × 1 = 120.',
      difficulty: 'easy',
      topic: 'Permutations',
    },
    {
      questionId: 'cogni_q5',
      question: 'Complete the analogy: Book : Pages :: Wall : ?',
      options: ['Cement', 'Bricks', 'Paint', 'Room'],
      correctAnswer: 1,
      explanation: 'A book is made of pages, a wall is made of bricks.',
      difficulty: 'easy',
      topic: 'Analogy',
    },
  ],
  Accenture: [
    {
      questionId: 'accent_q1',
      question: 'What is the smallest number divisible by 2, 3, 4, 5, and 6?',
      options: ['30', '60', '90', '120'],
      correctAnswer: 1,
      explanation: 'LCM of 2, 3, 4, 5, 6 = 60.',
      difficulty: 'easy',
      topic: 'LCM',
    },
    {
      questionId: 'accent_q2',
      question: 'If 3x + 7 = 22, what is the value of x?',
      options: ['3', '4', '5', '6'],
      correctAnswer: 2,
      explanation: '3x = 22 - 7 = 15, so x = 5.',
      difficulty: 'easy',
      topic: 'Algebra',
    },
    {
      questionId: 'accent_q3',
      question: 'A pipe can fill a tank in 6 hours. Due to a leak, it takes 8 hours. How long will the leak take to empty the full tank?',
      options: ['12 hours', '18 hours', '24 hours', '30 hours'],
      correctAnswer: 2,
      explanation: 'Pipe fills 1/6 per hour. With leak, fills 1/8 per hour. Leak empties 1/6 - 1/8 = 1/24 per hour. So 24 hours to empty.',
      difficulty: 'hard',
      topic: 'Pipes and Cisterns',
    },
    {
      questionId: 'accent_q4',
      question: 'The ratio of present ages of father and son is 7:2. After 5 years, the ratio will be 5:2. What is the present age of the son?',
      options: ['8 years', '10 years', '12 years', '14 years'],
      correctAnswer: 1,
      explanation: 'Let ages be 7x and 2x. (7x+5)/(2x+5) = 5/2. Solving: 14x + 10 = 10x + 25, 4x = 15, x = 3.75. Son\'s age = 2 × 3.75 = 7.5 ≈ 10 (nearest option).',
      difficulty: 'hard',
      topic: 'Age Problems',
    },
    {
      questionId: 'accent_q5',
      question: 'Find the missing number: 2, 5, 10, 17, 26, ?',
      options: ['35', '37', '39', '41'],
      correctAnswer: 1,
      explanation: 'The pattern is n²+1: 1²+1=2, 2²+1=5, 3²+1=10, 4²+1=17, 5²+1=26, 6²+1=37.',
      difficulty: 'medium',
      topic: 'Number Series',
    },
  ],
  Google: [
    {
      questionId: 'google_q1',
      question: 'What is the time complexity of binary search?',
      options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(n²)'],
      correctAnswer: 1,
      explanation: 'Binary search divides the search space in half each time, giving O(log n) complexity.',
      difficulty: 'easy',
      topic: 'Data Structures',
    },
    {
      questionId: 'google_q2',
      question: 'In a binary tree with n nodes, what is the maximum height?',
      options: ['n', 'n-1', 'log n', 'n/2'],
      correctAnswer: 1,
      explanation: 'In the worst case (skewed tree), height can be n-1.',
      difficulty: 'medium',
      topic: 'Data Structures',
    },
    {
      questionId: 'google_q3',
      question: 'What is the probability of getting at least one head when tossing a fair coin 3 times?',
      options: ['1/8', '3/8', '7/8', '1/2'],
      correctAnswer: 2,
      explanation: 'P(at least one head) = 1 - P(all tails) = 1 - (1/2)³ = 1 - 1/8 = 7/8.',
      difficulty: 'medium',
      topic: 'Probability',
    },
    {
      questionId: 'google_q4',
      question: 'If f(n) = 2f(n-1) + 1 with f(1) = 1, what is f(5)?',
      options: ['15', '31', '63', '127'],
      correctAnswer: 1,
      explanation: 'f(2)=3, f(3)=7, f(4)=15, f(5)=31. Pattern: f(n) = 2ⁿ - 1.',
      difficulty: 'hard',
      topic: 'Recursion',
    },
    {
      questionId: 'google_q5',
      question: 'How many distinct binary search trees can be formed with 3 distinct keys?',
      options: ['3', '4', '5', '6'],
      correctAnswer: 2,
      explanation: 'Catalan number C₃ = 5.',
      difficulty: 'hard',
      topic: 'Combinatorics',
    },
  ],
  Microsoft: [
    {
      questionId: 'ms_q1',
      question: 'What is the output of: int x = 5; printf("%d", ++x + x++);',
      options: ['10', '11', '12', '13'],
      correctAnswer: 2,
      explanation: '++x makes x=6, then x++ returns 6 (but makes x=7). So 6 + 6 = 12.',
      difficulty: 'medium',
      topic: 'Programming',
    },
    {
      questionId: 'ms_q2',
      question: 'Which sorting algorithm has the best average-case time complexity?',
      options: ['Bubble Sort', 'Insertion Sort', 'Quick Sort', 'Merge Sort'],
      correctAnswer: 2,
      explanation: 'Quick Sort has O(n log n) average case and is generally faster in practice.',
      difficulty: 'easy',
      topic: 'Algorithms',
    },
    {
      questionId: 'ms_q3',
      question: 'What is the maximum number of edges in an undirected graph with n vertices?',
      options: ['n', 'n-1', 'n(n-1)/2', 'n(n+1)/2'],
      correctAnswer: 2,
      explanation: 'Maximum edges = nC2 = n(n-1)/2.',
      difficulty: 'medium',
      topic: 'Graph Theory',
    },
    {
      questionId: 'ms_q4',
      question: 'In SQL, which join returns all records when there is a match in either table?',
      options: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL OUTER JOIN'],
      correctAnswer: 3,
      explanation: 'FULL OUTER JOIN returns all records when there is a match in either left or right table.',
      difficulty: 'easy',
      topic: 'Database',
    },
    {
      questionId: 'ms_q5',
      question: 'What is the space complexity of DFS on a graph with V vertices and E edges?',
      options: ['O(1)', 'O(V)', 'O(E)', 'O(V+E)'],
      correctAnswer: 1,
      explanation: 'DFS uses O(V) space for the visited array and recursion stack.',
      difficulty: 'medium',
      topic: 'Algorithms',
    },
  ],
  Amazon: [
    {
      questionId: 'amzn_q1',
      question: 'What data structure is used for implementing recursion?',
      options: ['Queue', 'Stack', 'Linked List', 'Array'],
      correctAnswer: 1,
      explanation: 'Recursion uses the call stack to store function calls.',
      difficulty: 'easy',
      topic: 'Data Structures',
    },
    {
      questionId: 'amzn_q2',
      question: 'In OOP, which feature allows a subclass to provide a specific implementation of a method?',
      options: ['Encapsulation', 'Inheritance', 'Polymorphism', 'Abstraction'],
      correctAnswer: 2,
      explanation: 'Polymorphism allows methods to be overridden in subclasses.',
      difficulty: 'easy',
      topic: 'OOP',
    },
    {
      questionId: 'amzn_q3',
      question: 'What is the time complexity of inserting an element at the beginning of an array?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
      correctAnswer: 2,
      explanation: 'All elements need to be shifted, so O(n) time.',
      difficulty: 'easy',
      topic: 'Data Structures',
    },
    {
      questionId: 'amzn_q4',
      question: 'Which HTTP method is used to update a resource?',
      options: ['GET', 'POST', 'PUT', 'DELETE'],
      correctAnswer: 2,
      explanation: 'PUT is used to update/replace a resource.',
      difficulty: 'easy',
      topic: 'Web Development',
    },
    {
      questionId: 'amzn_q5',
      question: 'What is the minimum number of queues needed to implement a stack?',
      options: ['1', '2', '3', '4'],
      correctAnswer: 1,
      explanation: 'A stack can be implemented using 2 queues.',
      difficulty: 'hard',
      topic: 'Data Structures',
    },
  ],
};

const seedAptitudeTests = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/placement-portal');
    console.log('Connected to MongoDB');

    // Clear existing aptitude tests
    await AptitudeTest.deleteMany({});
    console.log('Cleared existing aptitude tests');

    // Create tests for each company
    for (const company of companies) {
      const questions = aptitudeQuestions[company as keyof typeof aptitudeQuestions] || [];
      
      if (questions.length === 0) continue;

      const testTypes = ['quantitative', 'logical', 'verbal', 'mixed'];
      
      for (const type of testTypes) {
        const typeQuestions = questions.filter((q: any) => {
          if (type === 'quantitative') return ['Ratios', 'Average', 'Percentage', 'Profit', 'Interest', 'Time and', 'HCF', 'LCM', 'Mensuration', 'Algebra', 'Permutations', 'Probability', 'Number Series'].some(t => q.topic.includes(t));
          if (type === 'logical') return ['Coding', 'Odd One Out', 'Analogy', 'Age Problems', 'Pipes', 'Boats'].some(t => q.topic.includes(t));
          if (type === 'verbal') return false; // No verbal questions in our sample
          return true;
        });

        if (typeQuestions.length === 0) continue;

        const test = new AptitudeTest({
          title: `${company} ${type.charAt(0).toUpperCase() + type.slice(1)} Aptitude Test`,
          description: `Practice ${type} aptitude questions commonly asked in ${company} recruitment`,
          type: type as any,
          companies: [company],
          duration: 30,
          totalQuestions: typeQuestions.length,
          questions: typeQuestions,
          passingScore: 60,
          attempts: 0,
          averageScore: 0,
        });

        await test.save();
        console.log(`Created ${type} test for ${company} with ${typeQuestions.length} questions`);
      }
    }

    console.log('Aptitude tests seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding aptitude tests:', error);
    process.exit(1);
  }
};

seedAptitudeTests();
