import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { checkAnswer, calculateResults } from '../src/quizEngine.js';

const enumeration = { type: 'enumeration', answerGroups: [['Static'], ['Dynamic'], ['Semi-dynamic', 'Semidynamic']] };
assert.equal(checkAnswer({ ...enumeration, userAnswer: '1. dynamic\n2. SEMI DYNAMIC\n3. static' }), true);
assert.equal(checkAnswer({ ...enumeration, userAnswer: 'static; static; dynamic' }), false);
assert.equal(checkAnswer({ ...enumeration, userAnswer: 'static; dynamic' }), false);
assert.equal(checkAnswer({ ...enumeration, userAnswer: 'static; dynamic; semi-dynamic; extra' }), false);
const results = calculateResults([{ type: 'short_answer', correctAnswers: ['1956'], userAnswer: '1956' }, { type: 'essay', userAnswer: 'My explanation' }], 0, 1000, 'Test');
assert.equal(results.percentage, 100);
assert.equal(results.incorrectCount, 0);
assert.equal(results.essayCount, 1);
const catalog = JSON.parse(readFileSync('public/quizzes/index.json', 'utf8'));
assert.equal(catalog.length, 4);
assert.equal(readFileSync('public/quizzes/index.json', 'utf8'), readFileSync('quizzes/index.json', 'utf8'));
for (const { file } of catalog) {
  const name = file.replace(/\.json$/, '');
  const content = readFileSync(`public/quizzes/${name}.json`, 'utf8');
  assert.equal(content, readFileSync(`quizzes/${name}.json`, 'utf8'));
  const { questions } = JSON.parse(content);
  for (const q of questions) {
    if (q.type === 'essay') { assert.ok(q.modelAnswer && q.rubric.length && q.source); continue; }
    const answer = q.type === 'enumeration' ? q.answerGroups.map(g => g[0]).reverse().join('\n') : q.correctAnswers ? q.correctAnswers[0] : q.type === 'true_false' ? String(q.correctAnswer) : q.correctAnswer;
    assert.equal(checkAnswer({ ...q, userAnswer: answer }), true, q.question);
  }
  console.log(`${name}: ${questions.length} questions checked`);
}
for (const name of ['module-1-from-module', 'module-2-from-module']) {
  const { questions } = JSON.parse(readFileSync(`public/quizzes/${name}.json`, 'utf8'));
  assert.equal(questions.filter(q => q.type === 'multiple_choice').length, 10);
  assert.equal(questions.filter(q => q.type === 'essay').length, 4);
}
console.log('Enumeration edge cases and essay score exclusion passed.');
