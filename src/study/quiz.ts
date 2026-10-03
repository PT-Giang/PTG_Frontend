import type { QuizQuestion, StudyTerm } from "./types";

function normalizeAnswer(value: string): string {
  return value.normalize("NFKC").trim().replace(/\s+/g, " ").toLocaleLowerCase("vi");
}

export function isCorrectAnswer(actual: string, expected: string): boolean {
  return normalizeAnswer(actual) === normalizeAnswer(expected);
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

export function generateQuiz(terms: StudyTerm[], choiceCount: number, shortCount: number): QuizQuestion[] {
  const uniqueTerms = terms.filter((term, index) => term.term.trim() && term.definition.trim()
    && terms.findIndex((candidate) => isCorrectAnswer(candidate.term, term.term)) === index);
  const definitions = [...new Map(uniqueTerms.map((term) => [normalizeAnswer(term.definition), term.definition])).values()];
  const count = (value: number) => Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
  const choices = definitions.length > 1 ? Math.min(count(choiceCount), uniqueTerms.length) : 0;
  const shorts = Math.min(count(shortCount), uniqueTerms.length - choices);
  return shuffle(uniqueTerms).slice(0, choices + shorts).map((term, index) => {
    const isChoice = index < choices;
    return {
      id: term.id,
      prompt: isChoice ? `Định nghĩa nào phù hợp với “${term.term}”?` : `Thuật ngữ nào phù hợp với định nghĩa: ${term.definition}`,
      answer: isChoice ? term.definition : term.term,
      options: isChoice ? shuffle([term.definition, ...shuffle(definitions.filter((definition) => !isCorrectAnswer(definition, term.definition))).slice(0, 3)]) : [],
      type: isChoice ? "choice" : "short",
    };
  });
}
