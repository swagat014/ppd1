import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Problem from '../models/Problem.model';

dotenv.config();

const dsaProblems = [
  // TCS Problems
  {
    title: 'Two Sum',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.',
    difficulty: 'easy',
    category: 'Arrays',
    pattern: 'Two Pointers',
    companies: ['TCS', 'Infosys', 'Wipro', 'Cognizant', 'Accenture', 'Amazon'],
    tags: ['array', 'hash-table'],
    constraints: '- 2 <= nums.length <= 10^4\n- -10^9 <= nums[i] <= 10^9\n- -10^9 <= target <= 10^9\n- Only one valid answer exists.',
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
      },
      {
        input: 'nums = [3,2,4], target = 6',
        output: '[1,2]',
      },
    ],
    hints: ['Try using a hash map to store values and their indices.', 'For each number, check if target - num exists in the map.'],
    testCases: [
      { input: { nums: [2, 7, 11, 15], target: 9 }, expectedOutput: [0, 1], isPublic: true },
      { input: { nums: [3, 2, 4], target: 6 }, expectedOutput: [1, 2], isPublic: true },
      { input: { nums: [3, 3], target: 6 }, expectedOutput: [0, 1], isPublic: false },
    ],
    solution: {
      approach: 'Use a hash map to store each number and its index. For each number, check if complement (target - num) exists in the map.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      code: `function twoSum(nums, target) {
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
  },
  {
    title: 'Reverse a Linked List',
    description: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
    difficulty: 'easy',
    category: 'Linked List',
    pattern: 'Two Pointers',
    companies: ['TCS', 'Infosys', 'Wipro', 'Microsoft', 'Amazon'],
    tags: ['linked-list', 'recursion'],
    constraints: '- The number of nodes in the list is in the range [0, 5000]\n- -5000 <= Node.val <= 5000',
    examples: [
      {
        input: 'head = [1,2,3,4,5]',
        output: '[5,4,3,2,1]',
      },
      {
        input: 'head = [1,2]',
        output: '[2,1]',
      },
    ],
    hints: ['Use three pointers: prev, current, and next.', 'Iterate through the list and reverse the links.'],
    testCases: [
      { input: { head: [1, 2, 3, 4, 5] }, expectedOutput: [5, 4, 3, 2, 1], isPublic: true },
      { input: { head: [1, 2] }, expectedOutput: [2, 1], isPublic: true },
      { input: { head: [] }, expectedOutput: [], isPublic: false },
    ],
    solution: {
      approach: 'Iterate through the list with three pointers, reversing the next pointer of each node.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      code: `function reverseList(head) {
  let prev = null;
  let current = head;
  while (current !== null) {
    let next = current.next;
    current.next = prev;
    prev = current;
    current = next;
  }
  return prev;
}`,
    },
  },
  {
    title: 'Valid Parentheses',
    description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.',
    difficulty: 'easy',
    category: 'Strings',
    pattern: 'Stack',
    companies: ['TCS', 'Infosys', 'Wipro', 'Cognizant', 'Accenture', 'Google', 'Microsoft', 'Amazon'],
    tags: ['string', 'stack'],
    constraints: '- 1 <= s.length <= 10^4\n- s consists of parentheses only \'()[]{}\'.',
    examples: [
      {
        input: 's = "()"',
        output: 'true',
      },
      {
        input: 's = "()[]{}"',
        output: 'true',
      },
      {
        input: 's = "(]"',
        output: 'false',
      },
    ],
    hints: ['Use a stack to keep track of opening brackets.', 'When you see a closing bracket, check if it matches the top of the stack.'],
    testCases: [
      { input: { s: '()' }, expectedOutput: true, isPublic: true },
      { input: { s: '()[]{}' }, expectedOutput: true, isPublic: true },
      { input: { s: '(]' }, expectedOutput: false, isPublic: true },
      { input: { s: '([)]' }, expectedOutput: false, isPublic: false },
      { input: { s: '{[]}' }, expectedOutput: true, isPublic: false },
    ],
    solution: {
      approach: 'Use a stack. Push opening brackets, pop and check match when encountering closing brackets.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      code: `function isValid(s) {
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (let char of s) {
    if (char in map) {
      if (stack.pop() !== map[char]) return false;
    } else {
      stack.push(char);
    }
  }
  return stack.length === 0;
}`,
    },
  },
  {
    title: 'Maximum Subarray',
    description: 'Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.',
    difficulty: 'medium',
    category: 'Arrays',
    pattern: 'Dynamic Programming',
    companies: ['Google', 'Microsoft', 'Amazon', 'Meta'],
    tags: ['array', 'divide-and-conquer', 'dynamic-programming'],
    constraints: '- 1 <= nums.length <= 10^5\n- -10^4 <= nums[i] <= 10^4',
    examples: [
      {
        input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]',
        output: '6',
        explanation: 'The subarray [4,-1,2,1] has the largest sum 6.',
      },
      {
        input: 'nums = [1]',
        output: '1',
      },
    ],
    hints: ['Use Kadane\'s algorithm.', 'Keep track of current sum and maximum sum seen so far.'],
    testCases: [
      { input: { nums: [-2, 1, -3, 4, -1, 2, 1, -5, 4] }, expectedOutput: 6, isPublic: true },
      { input: { nums: [1] }, expectedOutput: 1, isPublic: true },
      { input: { nums: [5, 4, -1, 7, 8] }, expectedOutput: 23, isPublic: false },
    ],
    solution: {
      approach: 'Kadane\'s algorithm: at each position, decide whether to start a new subarray or extend the existing one.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      code: `function maxSubArray(nums) {
  let maxSum = nums[0];
  let currentSum = nums[0];
  for (let i = 1; i < nums.length; i++) {
    currentSum = Math.max(nums[i], currentSum + nums[i]);
    maxSum = Math.max(maxSum, currentSum);
  }
  return maxSum;
}`,
    },
  },
  {
    title: 'Binary Tree Level Order Traversal',
    description: 'Given the root of a binary tree, return the level order traversal of its nodes\' values. (i.e., from left to right, level by level).',
    difficulty: 'medium',
    category: 'Trees',
    pattern: 'BFS/DFS',
    companies: ['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple'],
    tags: ['tree', 'bfs', 'binary-tree'],
    constraints: '- The number of nodes in the tree is in the range [0, 2000]\n- -1000 <= Node.val <= 1000',
    examples: [
      {
        input: 'root = [3,9,20,null,null,15,7]',
        output: '[[3],[9,20],[15,7]]',
      },
      {
        input: 'root = [1]',
        output: '[[1]]',
      },
    ],
    hints: ['Use a queue for BFS traversal.', 'Process nodes level by level.'],
    testCases: [
      { input: { root: [3, 9, 20, null, null, 15, 7] }, expectedOutput: [[3], [9, 20], [15, 7]], isPublic: true },
      { input: { root: [1] }, expectedOutput: [[1]], isPublic: true },
      { input: { root: [] }, expectedOutput: [], isPublic: false },
    ],
    solution: {
      approach: 'Use BFS with a queue. Process all nodes at current level before moving to next level.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      code: `function levelOrder(root) {
  if (!root) return [];
  const result = [];
  const queue = [root];
  while (queue.length > 0) {
    const levelSize = queue.length;
    const level = [];
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();
      level.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    result.push(level);
  }
  return result;
}`,
    },
  },
  {
    title: 'Merge Intervals',
    description: 'Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.',
    difficulty: 'medium',
    category: 'Arrays',
    pattern: 'Sorting',
    companies: ['Google', 'Microsoft', 'Amazon', 'Meta'],
    tags: ['array', 'sorting'],
    constraints: '- 1 <= intervals.length <= 10^4\n- intervals[i].length == 2\n- 0 <= starti <= endi <= 10^4',
    examples: [
      {
        input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]',
        output: '[[1,6],[8,10],[15,18]]',
        explanation: 'Intervals [1,3] and [2,6] overlap, so they are merged into [1,6].',
      },
    ],
    hints: ['Sort intervals by start time.', 'Compare current interval with the last merged interval.'],
    testCases: [
      { input: { intervals: [[1, 3], [2, 6], [8, 10], [15, 18]] }, expectedOutput: [[1, 6], [8, 10], [15, 18]], isPublic: true },
      { input: { intervals: [[1, 4], [4, 5]] }, expectedOutput: [[1, 5]], isPublic: true },
      { input: { intervals: [[1, 4], [0, 4]] }, expectedOutput: [[0, 4]], isPublic: false },
    ],
    solution: {
      approach: 'Sort by start time, then iterate and merge overlapping intervals.',
      timeComplexity: 'O(n log n)',
      spaceComplexity: 'O(n)',
      code: `function merge(intervals) {
  if (intervals.length <= 1) return intervals;
  intervals.sort((a, b) => a[0] - b[0]);
  const merged = [intervals[0]];
  for (let i = 1; i < intervals.length; i++) {
    const last = merged[merged.length - 1];
    if (intervals[i][0] <= last[1]) {
      last[1] = Math.max(last[1], intervals[i][1]);
    } else {
      merged.push(intervals[i]);
    }
  }
  return merged;
}`,
    },
  },
  {
    title: 'Longest Substring Without Repeating Characters',
    description: 'Given a string s, find the length of the longest substring without repeating characters.',
    difficulty: 'medium',
    category: 'Strings',
    pattern: 'Sliding Window',
    companies: ['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple'],
    tags: ['hash-table', 'string', 'sliding-window'],
    constraints: '- 0 <= s.length <= 5 * 10^4\n- s consists of English letters, digits, symbols and spaces.',
    examples: [
      {
        input: 's = "abcabcbb"',
        output: '3',
        explanation: 'The answer is "abc", with the length of 3.',
      },
      {
        input: 's = "bbbbb"',
        output: '1',
        explanation: 'The answer is "b", with the length of 1.',
      },
    ],
    hints: ['Use sliding window technique.', 'Use a set or map to track characters in current window.'],
    testCases: [
      { input: { s: 'abcabcbb' }, expectedOutput: 3, isPublic: true },
      { input: { s: 'bbbbb' }, expectedOutput: 1, isPublic: true },
      { input: { s: 'pwwkew' }, expectedOutput: 3, isPublic: true },
      { input: { s: '' }, expectedOutput: 0, isPublic: false },
    ],
    solution: {
      approach: 'Sliding window with hash set. Expand window, shrink when duplicate found.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(min(m, n))',
      code: `function lengthOfLongestSubstring(s) {
  const set = new Set();
  let left = 0, maxLen = 0;
  for (let right = 0; right < s.length; right++) {
    while (set.has(s[right])) {
      set.delete(s[left]);
      left++;
    }
    set.add(s[right]);
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}`,
    },
  },
  {
    title: 'Course Schedule',
    description: 'There are a total of numCourses courses you have to take, labeled from 0 to numCourses - 1. You are given an array prerequisites where prerequisites[i] = [ai, bi] indicates that you must take course bi first if you want to take course ai.\n\nReturn true if you can finish all courses. Otherwise, return false.',
    difficulty: 'medium',
    category: 'Graphs',
    pattern: 'BFS/DFS',
    companies: ['Google', 'Microsoft', 'Amazon', 'Meta'],
    tags: ['depth-first-search', 'breadth-first-search', 'graph', 'topological-sort'],
    constraints: '- 1 <= numCourses <= 2000\n- 0 <= prerequisites.length <= 5000',
    examples: [
      {
        input: 'numCourses = 2, prerequisites = [[1,0]]',
        output: 'true',
        explanation: 'There are a total of 2 courses to take. To take course 1 you should have finished course 0. So it is possible.',
      },
      {
        input: 'numCourses = 2, prerequisites = [[1,0],[0,1]]',
        output: 'false',
        explanation: 'There are a total of 2 courses to take. To take course 1 you should have finished course 0, and to take course 0 you should also have finished course 1. So it is impossible.',
      },
    ],
    hints: ['This is a cycle detection problem in a directed graph.', 'Use topological sort (Kahn\'s algorithm) or DFS.'],
    testCases: [
      { input: { numCourses: 2, prerequisites: [[1, 0]] }, expectedOutput: true, isPublic: true },
      { input: { numCourses: 2, prerequisites: [[1, 0], [0, 1]] }, expectedOutput: false, isPublic: true },
      { input: { numCourses: 5, prerequisites: [[1, 4], [2, 4], [3, 1], [3, 2]] }, expectedOutput: true, isPublic: false },
    ],
    solution: {
      approach: 'Use Kahn\'s algorithm (BFS topological sort) or detect cycle using DFS.',
      timeComplexity: 'O(V + E)',
      spaceComplexity: 'O(V + E)',
      code: `function canFinish(numCourses, prerequisites) {
  const graph = Array.from({ length: numCourses }, () => []);
  const inDegree = new Array(numCourses).fill(0);
  for (const [course, prereq] of prerequisites) {
    graph[prereq].push(course);
    inDegree[course]++;
  }
  const queue = [];
  for (let i = 0; i < numCourses; i++) {
    if (inDegree[i] === 0) queue.push(i);
  }
  let visited = 0;
  while (queue.length > 0) {
    const course = queue.shift();
    visited++;
    for (const next of graph[course]) {
      inDegree[next]--;
      if (inDegree[next] === 0) queue.push(next);
    }
  }
  return visited === numCourses;
}`,
    },
  },
  {
    title: 'Trapping Rain Water',
    description: 'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
    difficulty: 'hard',
    category: 'Arrays',
    pattern: 'Two Pointers',
    companies: ['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple'],
    tags: ['array', 'two-pointers', 'dynamic-programming', 'stack'],
    constraints: '- n == height.length\n- 1 <= n <= 2 * 10^4\n- 0 <= height[i] <= 10^5',
    examples: [
      {
        input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]',
        output: '6',
        explanation: 'The above elevation map is represented by array [0,1,0,2,1,0,1,3,2,1,2,1]. In this case, 6 units of rain water are being trapped.',
      },
    ],
    hints: ['Water trapped at any position depends on max height on left and right.', 'Use two pointers approach for O(1) space.'],
    testCases: [
      { input: { height: [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1] }, expectedOutput: 6, isPublic: true },
      { input: { height: [4, 2, 0, 3, 2, 5] }, expectedOutput: 9, isPublic: true },
      { input: { height: [1, 1, 1] }, expectedOutput: 0, isPublic: false },
    ],
    solution: {
      approach: 'Two pointers: maintain left and right max, move the pointer with smaller max.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      code: `function trap(height) {
  let left = 0, right = height.length - 1;
  let leftMax = 0, rightMax = 0;
  let water = 0;
  while (left < right) {
    if (height[left] < height[right]) {
      if (height[left] >= leftMax) leftMax = height[left];
      else water += leftMax - height[left];
      left++;
    } else {
      if (height[right] >= rightMax) rightMax = height[right];
      else water += rightMax - height[right];
      right--;
    }
  }
  return water;
}`,
    },
  },
  {
    title: 'Word Break',
    description: 'Given a string s and a dictionary of strings wordDict, return true if s can be segmented into a space-separated sequence of one or more dictionary words.\n\nNote that the same word in the dictionary may be reused multiple times in the segmentation.',
    difficulty: 'medium',
    category: 'Dynamic Programming',
    pattern: 'Dynamic Programming',
    companies: ['Google', 'Microsoft', 'Amazon', 'Meta'],
    tags: ['hash-table', 'string', 'dynamic-programming', 'trie', 'memoization'],
    constraints: '- 1 <= s.length <= 300\n- 1 <= wordDict.length <= 1000',
    examples: [
      {
        input: 's = "leetcode", wordDict = ["leet","code"]',
        output: 'true',
        explanation: 'Return true because "leetcode" can be segmented as "leet code".',
      },
      {
        input: 's = "applepenapple", wordDict = ["apple","pen"]',
        output: 'true',
        explanation: 'Return true because "applepenapple" can be segmented as "apple pen apple".',
      },
    ],
    hints: ['Use dynamic programming.', 'dp[i] = true if s[0:i] can be segmented.'],
    testCases: [
      { input: { s: 'leetcode', wordDict: ['leet', 'code'] }, expectedOutput: true, isPublic: true },
      { input: { s: 'applepenapple', wordDict: ['apple', 'pen'] }, expectedOutput: true, isPublic: true },
      { input: { s: 'catsandog', wordDict: ['cats', 'dog', 'sand', 'and', 'cat'] }, expectedOutput: false, isPublic: true },
    ],
    solution: {
      approach: 'DP: dp[i] is true if there exists j < i such that dp[j] is true and s[j:i] is in wordDict.',
      timeComplexity: 'O(n²)',
      spaceComplexity: 'O(n)',
      code: `function wordBreak(s, wordDict) {
  const wordSet = new Set(wordDict);
  const dp = new Array(s.length + 1).fill(false);
  dp[0] = true;
  for (let i = 1; i <= s.length; i++) {
    for (let j = 0; j < i; j++) {
      if (dp[j] && wordSet.has(s.substring(j, i))) {
        dp[i] = true;
        break;
      }
    }
  }
  return dp[s.length];
}`,
    },
  },
  // Additional problems for service-based companies
  {
    title: 'Factorial of a Number',
    description: 'Given a positive integer n, return the factorial of n.',
    difficulty: 'easy',
    category: 'Math',
    pattern: 'Recursion',
    companies: ['TCS', 'Infosys', 'Wipro', 'Cognizant', 'Accenture'],
    tags: ['math', 'recursion'],
    constraints: '- 0 <= n <= 20',
    examples: [
      {
        input: 'n = 5',
        output: '120',
        explanation: '5! = 5 × 4 × 3 × 2 × 1 = 120',
      },
      {
        input: 'n = 0',
        output: '1',
        explanation: '0! = 1 by definition',
      },
    ],
    hints: ['Use recursion or iteration.', 'Base case: factorial(0) = 1.'],
    testCases: [
      { input: { n: 5 }, expectedOutput: 120, isPublic: true },
      { input: { n: 0 }, expectedOutput: 1, isPublic: true },
      { input: { n: 10 }, expectedOutput: 3628800, isPublic: false },
    ],
    solution: {
      approach: 'Use recursion or iterative approach to multiply numbers from 1 to n.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1) for iterative, O(n) for recursive',
      code: `function factorial(n) {
  if (n === 0 || n === 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}`,
    },
  },
  {
    title: 'Fibonacci Number',
    description: 'Given n, calculate F(n) where F(n) is the nth Fibonacci number.\n\nThe Fibonacci sequence is defined as:\nF(0) = 0, F(1) = 1\nF(n) = F(n - 1) + F(n - 2), for n > 1.',
    difficulty: 'easy',
    category: 'Dynamic Programming',
    pattern: 'Dynamic Programming',
    companies: ['TCS', 'Infosys', 'Wipro', 'Cognizant', 'Accenture', 'Google', 'Microsoft'],
    tags: ['math', 'dynamic-programming', 'recursion', 'memoization'],
    constraints: '- 0 <= n <= 30',
    examples: [
      {
        input: 'n = 2',
        output: '1',
        explanation: 'F(2) = F(1) + F(0) = 1 + 0 = 1.',
      },
      {
        input: 'n = 3',
        output: '2',
        explanation: 'F(3) = F(2) + F(1) = 1 + 1 = 2.',
      },
    ],
    hints: ['Use dynamic programming to avoid recalculating values.', 'Or use iterative approach with O(1) space.'],
    testCases: [
      { input: { n: 2 }, expectedOutput: 1, isPublic: true },
      { input: { n: 3 }, expectedOutput: 2, isPublic: true },
      { input: { n: 4 }, expectedOutput: 3, isPublic: true },
      { input: { n: 10 }, expectedOutput: 55, isPublic: false },
    ],
    solution: {
      approach: 'Use iterative DP with O(1) space. Keep track of only the last two values.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      code: `function fib(n) {
  if (n <= 1) return n;
  let prev2 = 0, prev1 = 1;
  for (let i = 2; i <= n; i++) {
    const current = prev1 + prev2;
    prev2 = prev1;
    prev1 = current;
  }
  return prev1;
}`,
    },
  },
  {
    title: 'Palindrome Number',
    description: 'Given an integer x, return true if x is a palindrome, and false otherwise.\n\nAn integer is a palindrome when it reads the same forward and backward.',
    difficulty: 'easy',
    category: 'Math',
    pattern: 'Two Pointers',
    companies: ['TCS', 'Infosys', 'Wipro', 'Cognizant', 'Accenture', 'Google'],
    tags: ['math'],
    constraints: '- -2^31 <= x <= 2^31 - 1',
    examples: [
      {
        input: 'x = 121',
        output: 'true',
        explanation: '121 reads as 121 from left to right and from right to left.',
      },
      {
        input: 'x = -121',
        output: 'false',
        explanation: 'From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome.',
      },
    ],
    hints: ['Convert to string and compare, or reverse half of the number.', 'Negative numbers are not palindromes.'],
    testCases: [
      { input: { x: 121 }, expectedOutput: true, isPublic: true },
      { input: { x: -121 }, expectedOutput: false, isPublic: true },
      { input: { x: 10 }, expectedOutput: false, isPublic: true },
      { input: { x: 12321 }, expectedOutput: true, isPublic: false },
    ],
    solution: {
      approach: 'Reverse half of the number and compare with the other half.',
      timeComplexity: 'O(log n)',
      spaceComplexity: 'O(1)',
      code: `function isPalindrome(x) {
  if (x < 0 || (x % 10 === 0 && x !== 0)) return false;
  let reversed = 0;
  while (x > reversed) {
    reversed = reversed * 10 + x % 10;
    x = Math.floor(x / 10);
  }
  return x === reversed || x === Math.floor(reversed / 10);
}`,
    },
  },
  {
    title: 'First Unique Character',
    description: 'Given a string s, find the first non-repeating character in it and return its index. If it does not exist, return -1.',
    difficulty: 'easy',
    category: 'Strings',
    pattern: 'Hash Table',
    companies: ['TCS', 'Infosys', 'Wipro', 'Cognizant', 'Accenture', 'Amazon'],
    tags: ['hash-table', 'string', 'queue'],
    constraints: '- 1 <= s.length <= 10^5\n- s consists of only lowercase English letters.',
    examples: [
      {
        input: 's = "leetcode"',
        output: '0',
        explanation: 'The first non-repeating character is \'l\' at index 0.',
      },
      {
        input: 's = "loveleetcode"',
        output: '2',
        explanation: 'The first non-repeating character is \'v\' at index 2.',
      },
    ],
    hints: ['Use a hash map to count character frequencies.', 'Then scan the string to find the first character with count 1.'],
    testCases: [
      { input: { s: 'leetcode' }, expectedOutput: 0, isPublic: true },
      { input: { s: 'loveleetcode' }, expectedOutput: 2, isPublic: true },
      { input: { s: 'aabb' }, expectedOutput: -1, isPublic: true },
      { input: { s: 'z' }, expectedOutput: 0, isPublic: false },
    ],
    solution: {
      approach: 'Count frequency of each character, then find first character with frequency 1.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1) - at most 26 characters',
      code: `function firstUniqChar(s) {
  const count = {};
  for (let char of s) {
    count[char] = (count[char] || 0) + 1;
  }
  for (let i = 0; i < s.length; i++) {
    if (count[s[i]] === 1) return i;
  }
  return -1;
}`,
    },
  },
  // Additional problems
  {
    title: 'Contains Duplicate',
    description: 'Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.',
    difficulty: 'easy',
    category: 'Arrays',
    pattern: 'Hash Table',
    companies: ['TCS', 'Infosys', 'Wipro', 'Google', 'Amazon'],
    tags: ['array', 'hash-table', 'sorting'],
    constraints: '- 1 <= nums.length <= 10^5\n- -10^9 <= nums[i] <= 10^9',
    examples: [
      {
        input: 'nums = [1,2,3,1]',
        output: 'true',
        explanation: 'The element 1 occurs at the indices 0 and 3.',
      },
      {
        input: 'nums = [1,2,3,4]',
        output: 'false',
        explanation: 'All elements are distinct.',
      },
    ],
    hints: ['Use a hash set to track seen elements.', 'Return true as soon as you see a duplicate.'],
    testCases: [
      { input: { nums: [1, 2, 3, 1] }, expectedOutput: true, isPublic: true },
      { input: { nums: [1, 2, 3, 4] }, expectedOutput: false, isPublic: true },
      { input: { nums: [1, 1, 1, 3, 3, 4, 3, 2, 4, 2] }, expectedOutput: true, isPublic: true },
    ],
    solution: {
      approach: 'Use a Set to track seen elements. If element already in set, return true.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      code: `function containsDuplicate(nums) {
  const seen = new Set();
  for (let num of nums) {
    if (seen.has(num)) return true;
    seen.add(num);
  }
  return false;
}`,
    },
  },
  {
    title: 'Best Time to Buy and Sell Stock',
    description: 'You are given an array prices where prices[i] is the price of a given stock on the ith day.\n\nYou want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.\n\nReturn the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.',
    difficulty: 'easy',
    category: 'Arrays',
    pattern: 'Dynamic Programming',
    companies: ['Amazon', 'Microsoft', 'Google', 'Meta', 'Apple'],
    tags: ['array', 'dynamic-programming'],
    constraints: '- 1 <= prices.length <= 10^5\n- 0 <= prices[i] <= 10^4',
    examples: [
      {
        input: 'prices = [7,1,5,3,6,4]',
        output: '5',
        explanation: 'Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.',
      },
      {
        input: 'prices = [7,6,4,3,1]',
        output: '0',
        explanation: 'In this case, no transactions are done and the max profit = 0.',
      },
    ],
    hints: ['Track the minimum price seen so far.', 'Calculate profit if sold today and update max profit.'],
    testCases: [
      { input: { prices: [7, 1, 5, 3, 6, 4] }, expectedOutput: 5, isPublic: true },
      { input: { prices: [7, 6, 4, 3, 1] }, expectedOutput: 0, isPublic: true },
      { input: { prices: [2, 4, 1] }, expectedOutput: 2, isPublic: false },
    ],
    solution: {
      approach: 'Track minimum price and maximum profit in a single pass.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      code: `function maxProfit(prices) {
  let minPrice = Infinity;
  let maxProfit = 0;
  for (let price of prices) {
    if (price < minPrice) minPrice = price;
    else if (price - minPrice > maxProfit) maxProfit = price - minPrice;
  }
  return maxProfit;
}`,
    },
  },
  {
    title: 'Plus One',
    description: 'You are given a large integer represented as an integer array digits, where each digits[i] is the ith digit of the integer. The digits are ordered from most significant to least significant in left-to-right order. The large integer does not contain any leading 0\'s.\n\nIncrement the large integer by one and return the resulting array of digits.',
    difficulty: 'easy',
    category: 'Arrays',
    pattern: 'Math',
    companies: ['TCS', 'Infosys', 'Wipro', 'Cognizant', 'Google'],
    tags: ['array', 'math'],
    constraints: '- 1 <= digits.length <= 100\n- 0 <= digits[i] <= 9\n- digits does not contain any leading 0\'s.',
    examples: [
      {
        input: 'digits = [1,2,3]',
        output: '[1,2,4]',
        explanation: 'The array represents the integer 123. Incrementing by one gives 123 + 1 = 124.',
      },
      {
        input: 'digits = [9,9,9]',
        output: '[1,0,0,0]',
        explanation: 'The array represents the integer 999. Incrementing by one gives 999 + 1 = 1000.',
      },
    ],
    hints: ['Start from the end of the array.', 'Handle the carry-over case when digit is 9.'],
    testCases: [
      { input: { digits: [1, 2, 3] }, expectedOutput: [1, 2, 4], isPublic: true },
      { input: { digits: [4, 3, 2, 1] }, expectedOutput: [4, 3, 2, 2], isPublic: true },
      { input: { digits: [9] }, expectedOutput: [1, 0], isPublic: true },
      { input: { digits: [9, 9, 9] }, expectedOutput: [1, 0, 0, 0], isPublic: false },
    ],
    solution: {
      approach: 'Start from the end, add 1, handle carry. If carry remains after loop, add 1 at beginning.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      code: `function plusOne(digits) {
  for (let i = digits.length - 1; i >= 0; i--) {
    if (digits[i] < 9) {
      digits[i]++;
      return digits;
    }
    digits[i] = 0;
  }
  return [1, ...digits];
}`,
    },
  },
  {
    title: 'Move Zeroes',
    description: 'Given an integer array nums, move all 0\'s to the end of it while maintaining the relative order of the non-zero elements.\n\nNote that you must do this in-place without making a copy of the array.',
    difficulty: 'easy',
    category: 'Arrays',
    pattern: 'Two Pointers',
    companies: ['TCS', 'Infosys', 'Wipro', 'Amazon', 'Facebook'],
    tags: ['array', 'two-pointers'],
    constraints: '- 1 <= nums.length <= 10^4\n- -2^31 <= nums[i] <= 2^31 - 1',
    examples: [
      {
        input: 'nums = [0,1,0,3,12]',
        output: '[1,3,12,0,0]',
      },
      {
        input: 'nums = [0]',
        output: '[0]',
      },
    ],
    hints: ['Use two pointers technique.', 'One pointer for iteration, another for placement.'],
    testCases: [
      { input: { nums: [0, 1, 0, 3, 12] }, expectedOutput: [1, 3, 12, 0, 0], isPublic: true },
      { input: { nums: [0] }, expectedOutput: [0], isPublic: true },
      { input: { nums: [1, 0, 1] }, expectedOutput: [1, 1, 0], isPublic: false },
    ],
    solution: {
      approach: 'Use two pointers: one for non-zero elements, another for placement.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      code: `function moveZeroes(nums) {
  let nonZeroIndex = 0;
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] !== 0) {
      [nums[nonZeroIndex], nums[i]] = [nums[i], nums[nonZeroIndex]];
      nonZeroIndex++;
    }
  }
  return nums;
}`,
    },
  },
  {
    title: 'Climbing Stairs',
    description: 'You are climbing a staircase. It takes n steps to reach the top.\n\nEach time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
    difficulty: 'easy',
    category: 'Dynamic Programming',
    pattern: 'Dynamic Programming',
    companies: ['TCS', 'Infosys', 'Wipro', 'Google', 'Amazon', 'Microsoft'],
    tags: ['dynamic-programming', 'math', 'memoization'],
    constraints: '- 1 <= n <= 45',
    examples: [
      {
        input: 'n = 2',
        output: '2',
        explanation: 'There are two ways to climb to the top: 1 step + 1 step, or 2 steps.',
      },
      {
        input: 'n = 3',
        output: '3',
        explanation: 'There are three ways: 1+1+1, 1+2, 2+1.',
      },
    ],
    hints: ['This is similar to Fibonacci sequence.', 'Ways(n) = Ways(n-1) + Ways(n-2).'],
    testCases: [
      { input: { n: 2 }, expectedOutput: 2, isPublic: true },
      { input: { n: 3 }, expectedOutput: 3, isPublic: true },
      { input: { n: 4 }, expectedOutput: 5, isPublic: false },
      { input: { n: 5 }, expectedOutput: 8, isPublic: false },
    ],
    solution: {
      approach: 'Use dynamic programming. Each step can be reached from previous step or step before that.',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      code: `function climbStairs(n) {
  if (n <= 2) return n;
  let prev2 = 1, prev1 = 2;
  for (let i = 3; i <= n; i++) {
    const current = prev1 + prev2;
    prev2 = prev1;
    prev1 = current;
  }
  return prev1;
}`,
    },
  },
];

const seedDSAProblems = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/placement-portal');
    console.log('Connected to MongoDB');

    // Clear existing problems
    await Problem.deleteMany({});
    console.log('Cleared existing DSA problems');

    // Insert all problems
    for (const problemData of dsaProblems) {
      const problem = new Problem({
        ...problemData,
        submissions: Math.floor(Math.random() * 1000) + 100,
        acceptanceRate: Math.floor(Math.random() * 40) + 40, // 40-80% acceptance rate
      });
      await problem.save();
      console.log(`Created problem: ${problemData.title}`);
    }

    console.log('DSA problems seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding DSA problems:', error);
    process.exit(1);
  }
};

seedDSAProblems();
