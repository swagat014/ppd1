import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Problem from '../models/Problem.model';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/placement-platform';

const problems = [
  {
    title: 'Two Sum',
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
    difficulty: 'easy',
    category: 'Arrays',
    pattern: 'Hash Table',
    companies: ['Google', 'Amazon', 'Microsoft', 'TCS', 'Infosys'],
    tags: ['array', 'hash-table'],
    constraints: `2 <= nums.length <= 10^4
-10^9 <= nums[i] <= 10^9
-10^9 <= target <= 10^9
Only one valid answer exists.`,
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]' },
      { input: 'nums = [3,3], target = 6', output: '[0,1]' },
    ],
    hints: [
      'A really brute force way would be to search for all possible pairs of numbers but that would be too slow.',
      'Try to use a hash map to store the nums you have seen and check if the complement exists.',
    ],
    testCases: [
      { input: { nums: [2, 7, 11, 15], target: 9 }, expectedOutput: [0, 1], isPublic: true },
      { input: { nums: [3, 2, 4], target: 6 }, expectedOutput: [1, 2], isPublic: true },
      { input: { nums: [3, 3], target: 6 }, expectedOutput: [0, 1], isPublic: false },
      { input: { nums: [1, 5, 3, 7, 2], target: 8 }, expectedOutput: [1, 4], isPublic: false },
    ],
    solution: {
      approach: 'Use a hash map to store each element and its index. For each number, check if the complement (target - num) exists in the map. If yes, return the indices.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      code: `function solve(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
    },
    submissions: 0,
    acceptanceRate: 0,
  },
  {
    title: 'Valid Parentheses',
    description: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
- Open brackets must be closed by the same type of brackets.
- Open brackets must be closed in the correct order.
- Every close bracket has a corresponding open bracket of the same type.`,
    difficulty: 'easy',
    category: 'Stack',
    pattern: 'Stack',
    companies: ['Amazon', 'Microsoft', 'Google', 'Wipro', 'Cognizant'],
    tags: ['stack', 'string'],
    constraints: `1 <= s.length <= 10^4
s consists of parentheses only '()[]{}'`,
    examples: [
      { input: 's = "()"', output: 'true' },
      { input: 's = "()[]{}"', output: 'true' },
      { input: 's = "(]"', output: 'false' },
    ],
    hints: [
      'Use a stack data structure.',
      'Push opening brackets to the stack; when a closing bracket is seen, pop from stack and check if it matches.',
    ],
    testCases: [
      { input: { s: '()' }, expectedOutput: true, isPublic: true },
      { input: { s: '()[]{}' }, expectedOutput: true, isPublic: true },
      { input: { s: '(]' }, expectedOutput: false, isPublic: true },
      { input: { s: '([)]' }, expectedOutput: false, isPublic: false },
      { input: { s: '{[]}' }, expectedOutput: true, isPublic: false },
    ],
    solution: {
      approach: 'Use a stack. Iterate the string: push opening brackets onto the stack. For closing brackets, check if the top of the stack is the matching opener.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      code: `function solve(s) {
  const stack = [];
  const map = { ')': '(', ']': '[', '}': '{' };
  for (const ch of s) {
    if ('([{'.includes(ch)) {
      stack.push(ch);
    } else {
      if (stack.pop() !== map[ch]) return false;
    }
  }
  return stack.length === 0;
}`,
    },
    submissions: 0,
    acceptanceRate: 0,
  },
  {
    title: 'Maximum Subarray',
    description: `Given an integer array nums, find the subarray with the largest sum, and return its sum.`,
    difficulty: 'medium',
    category: 'Dynamic Programming',
    pattern: 'Dynamic Programming',
    companies: ['Amazon', 'Google', 'Microsoft', 'TCS', 'Infosys', 'Accenture'],
    tags: ['array', 'dynamic-programming', 'divide-and-conquer'],
    constraints: `1 <= nums.length <= 10^5
-10^4 <= nums[i] <= 10^4`,
    examples: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: '[4,-1,2,1] has the largest sum = 6.' },
      { input: 'nums = [1]', output: '1' },
      { input: 'nums = [5,4,-1,7,8]', output: '23' },
    ],
    hints: [
      "Kadane's Algorithm: maintain a current sum and a max sum.",
      'If the current element is bigger than current sum + element, restart from current element.',
    ],
    testCases: [
      { input: { nums: [-2, 1, -3, 4, -1, 2, 1, -5, 4] }, expectedOutput: 6, isPublic: true },
      { input: { nums: [1] }, expectedOutput: 1, isPublic: true },
      { input: { nums: [5, 4, -1, 7, 8] }, expectedOutput: 23, isPublic: false },
      { input: { nums: [-1] }, expectedOutput: -1, isPublic: false },
    ],
    solution: {
      approach: "Kadane's Algorithm: track current running sum and global maximum. At each index, decide whether to extend the current subarray or start fresh.",
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      code: `function solve(nums) {
  let maxSum = nums[0];
  let currentSum = nums[0];
  for (let i = 1; i < nums.length; i++) {
    currentSum = Math.max(nums[i], currentSum + nums[i]);
    maxSum = Math.max(maxSum, currentSum);
  }
  return maxSum;
}`,
    },
    submissions: 0,
    acceptanceRate: 0,
  },
  {
    title: 'Binary Search',
    description: `Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1.

You must write an algorithm with O(log n) runtime complexity.`,
    difficulty: 'easy',
    category: 'Arrays',
    pattern: 'Binary Search',
    companies: ['Google', 'Amazon', 'Microsoft', 'TCS', 'Infosys'],
    tags: ['array', 'binary-search'],
    constraints: `1 <= nums.length <= 10^4
-10^4 < nums[i], target < 10^4
All the integers in nums are unique.
nums is sorted in ascending order.`,
    examples: [
      { input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4', explanation: '9 exists in nums and its index is 4.' },
      { input: 'nums = [-1,0,3,5,9,12], target = 2', output: '-1', explanation: '2 does not exist in nums so return -1.' },
    ],
    hints: [
      'Use two pointers (left and right) to narrow the search space by half each iteration.',
    ],
    testCases: [
      { input: { nums: [-1, 0, 3, 5, 9, 12], target: 9 }, expectedOutput: 4, isPublic: true },
      { input: { nums: [-1, 0, 3, 5, 9, 12], target: 2 }, expectedOutput: -1, isPublic: true },
      { input: { nums: [1], target: 0 }, expectedOutput: -1, isPublic: false },
      { input: { nums: [1, 3, 5, 7, 9, 11], target: 7 }, expectedOutput: 3, isPublic: false },
    ],
    solution: {
      approach: 'Classic binary search: maintain left and right pointers, check the midpoint each iteration, and narrow the search to the appropriate half.',
      timeComplexity: 'O(log n)',
      spaceComplexity: 'O(1)',
      code: `function solve(nums, target) {
  let left = 0, right = nums.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`,
    },
    submissions: 0,
    acceptanceRate: 0,
  },
  {
    title: 'Merge Two Sorted Lists',
    description: `You are given the heads of two sorted linked lists list1 and list2.

Merge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists.

Return the head of the merged linked list.`,
    difficulty: 'easy',
    category: 'Linked List',
    pattern: 'Two Pointers',
    companies: ['Amazon', 'Microsoft', 'Google', 'Infosys'],
    tags: ['linked-list', 'recursion'],
    constraints: `The number of nodes in both lists is in the range [0, 50].
-100 <= Node.val <= 100
Both list1 and list2 are sorted in non-decreasing order.`,
    examples: [
      { input: 'list1 = [1,2,4], list2 = [1,3,4]', output: '[1,1,2,3,4,4]' },
      { input: 'list1 = [], list2 = []', output: '[]' },
      { input: 'list1 = [], list2 = [0]', output: '[0]' },
    ],
    hints: [
      'Think recursively: which list has the smaller head? That node comes first.',
    ],
    testCases: [
      { input: { list1: [1, 2, 4], list2: [1, 3, 4] }, expectedOutput: [1, 1, 2, 3, 4, 4], isPublic: true },
      { input: { list1: [], list2: [] }, expectedOutput: [], isPublic: true },
      { input: { list1: [], list2: [0] }, expectedOutput: [0], isPublic: false },
    ],
    solution: {
      approach: 'Use a dummy head node and two pointers to merge by comparing values at each step until one list is exhausted, then append the remaining list.',
      timeComplexity: 'O(m + n)',
      spaceComplexity: 'O(1)',
      code: `function solve(list1, list2) {
  // Since we're working with arrays (not real linked lists)
  const result = [];
  let i = 0, j = 0;
  while (i < list1.length && j < list2.length) {
    if (list1[i] <= list2[j]) result.push(list1[i++]);
    else result.push(list2[j++]);
  }
  while (i < list1.length) result.push(list1[i++]);
  while (j < list2.length) result.push(list2[j++]);
  return result;
}`,
    },
    submissions: 0,
    acceptanceRate: 0,
  },
  {
    title: 'Climbing Stairs',
    description: `You are climbing a staircase. It takes n steps to reach the top.

Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?`,
    difficulty: 'easy',
    category: 'Dynamic Programming',
    pattern: 'Dynamic Programming',
    companies: ['Amazon', 'Google', 'TCS', 'Wipro', 'Accenture'],
    tags: ['math', 'dynamic-programming', 'memoization'],
    constraints: `1 <= n <= 45`,
    examples: [
      { input: 'n = 2', output: '2', explanation: 'Two ways: 1 step + 1 step, or 2 steps.' },
      { input: 'n = 3', output: '3', explanation: 'Three ways: 1+1+1, 1+2, 2+1.' },
    ],
    hints: [
      'To reach step n, you can come from step n-1 (taking 1 step) or step n-2 (taking 2 steps).',
      'This is essentially the Fibonacci sequence!',
    ],
    testCases: [
      { input: { n: 2 }, expectedOutput: 2, isPublic: true },
      { input: { n: 3 }, expectedOutput: 3, isPublic: true },
      { input: { n: 5 }, expectedOutput: 8, isPublic: false },
      { input: { n: 10 }, expectedOutput: 89, isPublic: false },
    ],
    solution: {
      approach: 'Dynamic programming (bottom-up): dp[i] = dp[i-1] + dp[i-2]. This is exactly the Fibonacci sequence starting at 1, 1.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      code: `function solve(n) {
  if (n <= 2) return n;
  let a = 1, b = 2;
  for (let i = 3; i <= n; i++) {
    [a, b] = [b, a + b];
  }
  return b;
}`,
    },
    submissions: 0,
    acceptanceRate: 0,
  },
  {
    title: 'Reverse Linked List',
    description: `Given the head of a singly linked list, reverse the list, and return the reversed list.`,
    difficulty: 'easy',
    category: 'Linked List',
    pattern: 'Two Pointers',
    companies: ['Amazon', 'Microsoft', 'Infosys', 'TCS'],
    tags: ['linked-list', 'recursion'],
    constraints: `The number of nodes in the list is in range [0, 5000].
-5000 <= Node.val <= 5000`,
    examples: [
      { input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]' },
      { input: 'head = [1,2]', output: '[2,1]' },
      { input: 'head = []', output: '[]' },
    ],
    hints: [
      'Use three pointers: prev, curr, and next.',
    ],
    testCases: [
      { input: { head: [1, 2, 3, 4, 5] }, expectedOutput: [5, 4, 3, 2, 1], isPublic: true },
      { input: { head: [1, 2] }, expectedOutput: [2, 1], isPublic: true },
      { input: { head: [] }, expectedOutput: [], isPublic: false },
    ],
    solution: {
      approach: 'Iterative: use prev and curr pointers; reverse direction at each step.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      code: `function solve(head) {
  return head.reverse();
}`,
    },
    submissions: 0,
    acceptanceRate: 0,
  },
  {
    title: 'Number of Islands',
    description: `Given an m x n 2D binary grid grid which represents a map of '1's (land) and '0's (water), return the number of islands.

An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.`,
    difficulty: 'medium',
    category: 'Graphs',
    pattern: 'BFS/DFS',
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta'],
    tags: ['depth-first-search', 'breadth-first-search', 'union-find', 'matrix'],
    constraints: `m == grid.length
n == grid[i].length
1 <= m, n <= 300
grid[i][j] is '0' or '1'.`,
    examples: [
      {
        input: 'grid = [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]',
        output: '1',
      },
      {
        input: 'grid = [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]',
        output: '3',
      },
    ],
    hints: [
      'Use DFS/BFS to explore each island and mark visited cells.',
      'Count the number of times you start a new DFS/BFS from an unvisited land cell.',
    ],
    testCases: [
      {
        input: { grid: [['1','1','1','1','0'],['1','1','0','1','0'],['1','1','0','0','0'],['0','0','0','0','0']] },
        expectedOutput: 1, isPublic: true
      },
      {
        input: { grid: [['1','1','0','0','0'],['1','1','0','0','0'],['0','0','1','0','0'],['0','0','0','1','1']] },
        expectedOutput: 3, isPublic: true
      },
    ],
    solution: {
      approach: 'DFS: for each unvisited land cell (\'1\'), increment the island count and run DFS to mark the entire island as visited.',
      timeComplexity: 'O(m * n)',
      spaceComplexity: 'O(m * n)',
      code: `function solve(grid) {
  if (!grid || grid.length === 0) return 0;
  let count = 0;
  function dfs(r, c) {
    if (r < 0 || c < 0 || r >= grid.length || c >= grid[0].length || grid[r][c] !== '1') return;
    grid[r][c] = '0';
    dfs(r+1,c); dfs(r-1,c); dfs(r,c+1); dfs(r,c-1);
  }
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[0].length; c++) {
      if (grid[r][c] === '1') { count++; dfs(r, c); }
    }
  }
  return count;
}`,
    },
    submissions: 0,
    acceptanceRate: 0,
  },
  {
    title: 'Longest Common Subsequence',
    description: `Given two strings text1 and text2, return the length of their longest common subsequence. If there is no common subsequence, return 0.

A subsequence of a string is a new string generated from the original string with some characters (can be none) deleted without changing the relative order of the remaining characters.`,
    difficulty: 'medium',
    category: 'Dynamic Programming',
    pattern: 'Dynamic Programming',
    companies: ['Google', 'Amazon', 'Microsoft', 'Apple'],
    tags: ['string', 'dynamic-programming'],
    constraints: `1 <= text1.length, text2.length <= 1000
text1 and text2 consist of only lowercase English characters.`,
    examples: [
      { input: 'text1 = "abcde", text2 = "ace"', output: '3', explanation: 'The LCS is "ace" which has length 3.' },
      { input: 'text1 = "abc", text2 = "abc"', output: '3', explanation: 'The LCS is "abc" which has length 3.' },
      { input: 'text1 = "abc", text2 = "def"', output: '0', explanation: 'There is no LCS, so return 0.' },
    ],
    hints: [
      'Use a 2D DP table where dp[i][j] = LCS of text1[0..i-1] and text2[0..j-1].',
      'If text1[i-1] == text2[j-1], dp[i][j] = dp[i-1][j-1] + 1. Otherwise, dp[i][j] = max(dp[i-1][j], dp[i][j-1]).',
    ],
    testCases: [
      { input: { text1: 'abcde', text2: 'ace' }, expectedOutput: 3, isPublic: true },
      { input: { text1: 'abc', text2: 'abc' }, expectedOutput: 3, isPublic: true },
      { input: { text1: 'abc', text2: 'def' }, expectedOutput: 0, isPublic: false },
    ],
    solution: {
      approach: 'Classic 2D DP. Build a table where each cell represents the LCS length of the corresponding prefixes.',
      timeComplexity: 'O(m * n)',
      spaceComplexity: 'O(m * n)',
      code: `function solve(text1, text2) {
  const m = text1.length, n = text2.length;
  const dp = Array.from({length: m+1}, () => new Array(n+1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (text1[i-1] === text2[j-1]) dp[i][j] = dp[i-1][j-1] + 1;
      else dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);
    }
  }
  return dp[m][n];
}`,
    },
    submissions: 0,
    acceptanceRate: 0,
  },
  {
    title: 'Coin Change',
    description: `You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money.

Return the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return -1.

You may assume that you have an infinite number of each kind of coin.`,
    difficulty: 'medium',
    category: 'Dynamic Programming',
    pattern: 'Dynamic Programming',
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta'],
    tags: ['array', 'dynamic-programming', 'breadth-first-search'],
    constraints: `1 <= coins.length <= 12
1 <= coins[i] <= 2^31 - 1
0 <= amount <= 10^4`,
    examples: [
      { input: 'coins = [1,5,11,25], amount = 11', output: '1', explanation: '11 = 11.' },
      { input: 'coins = [2], amount = 3', output: '-1' },
      { input: 'coins = [1], amount = 0', output: '0' },
    ],
    hints: [
      'Use bottom-up DP: dp[i] = min coins needed to make amount i.',
      'For each amount, try every coin.',
    ],
    testCases: [
      { input: { coins: [1, 5, 11, 25], amount: 11 }, expectedOutput: 1, isPublic: true },
      { input: { coins: [2], amount: 3 }, expectedOutput: -1, isPublic: true },
      { input: { coins: [1], amount: 0 }, expectedOutput: 0, isPublic: false },
      { input: { coins: [1, 2, 5], amount: 11 }, expectedOutput: 3, isPublic: false },
    ],
    solution: {
      approach: 'Bottom-up DP: dp[0]=0, dp[i] = min(dp[i], dp[i-coin]+1) for each coin.',
      timeComplexity: 'O(amount * coins.length)',
      spaceComplexity: 'O(amount)',
      code: `function solve(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (coin <= i) dp[i] = Math.min(dp[i], dp[i - coin] + 1);
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}`,
    },
    submissions: 0,
    acceptanceRate: 0,
  },
];

async function seedDSA() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  let created = 0;
  let skipped = 0;

  for (const problem of problems) {
    const exists = await Problem.findOne({ title: problem.title });
    if (exists) {
      console.log(`⏩ Skipping: "${problem.title}" (already exists)`);
      skipped++;
    } else {
      await Problem.create(problem);
      console.log(`✅ Created: "${problem.title}"`);
      created++;
    }
  }

  console.log(`\n🎯 DSA Seeding complete! Created: ${created}, Skipped: ${skipped}`);
  await mongoose.disconnect();
}

seedDSA().catch(console.error);
