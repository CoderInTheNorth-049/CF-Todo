/**
 * Parse Codeforces URL and extract contest/problem information
 * @param {string} url - The Codeforces URL
 * @returns {object} - Parsed information with type, contestId, problemIndex
 */
export const parseCodeforcesUrl = url => {
  try {
    // Contest URL: https://codeforces.com/contest/1234
    const contestMatch = url.match(/\/contest\/(\d+)\/?$/)
    if (contestMatch) {
      return {
        type: 'contest',
        contestId: contestMatch[1],
      }
    }

    // Single Problem URL: https://codeforces.com/problemset/problem/1234/A
    const problemMatch = url.match(/\/problemset\/problem\/(\d+)\/([A-Z]\d?)/)
    if (problemMatch) {
      return {
        type: 'problem',
        contestId: problemMatch[1],
        problemIndex: problemMatch[2],
      }
    }

    // Contest Problem URL: https://codeforces.com/contest/1234/problem/A
    const contestProblemMatch = url.match(
      /\/contest\/(\d+)\/problem\/([A-Z]\d?)/
    )
    if (contestProblemMatch) {
      return {
        type: 'problem',
        contestId: contestProblemMatch[1],
        problemIndex: contestProblemMatch[2],
      }
    }

    return { type: 'invalid' }
  } catch (error) {
    return { type: 'invalid', error: error.message }
  }
}

/**
 * Build problem URL from contest and problem index
 */
export const buildProblemUrl = (contestId, problemIndex) => {
  return `https://codeforces.com/problemset/problem/${contestId}/${problemIndex}`
}

/**
 * Fetch contest problems from Codeforces API
 */
export const fetchContestProblems = async contestId => {
  const response = await fetch(
    `https://codeforces.com/api/contest.standings?contestId=${contestId}&from=1&count=1`
  )

  if (!response.ok) {
    throw new Error('Failed to fetch contest data')
  }

  const data = await response.json()

  if (data.status !== 'OK') {
    throw new Error(data.comment || 'API returned error status')
  }

  return data.result.problems.map(problem => ({
    name: `${problem.index}. ${problem.name}`,
    url: buildProblemUrl(contestId, problem.index),
    rating: problem.rating || 0,
    tags: problem.tags || [],
    contestId,
    problemIndex: problem.index,
  }))
}

/**
 * Fetch user submissions for a contest
 */
export const fetchUserSubmissions = async (username, contestId) => {
  const response = await fetch(
    `https://codeforces.com/api/user.status?handle=${username}&from=1&count=1000`
  )

  if (!response.ok) {
    throw new Error('Failed to fetch user submissions')
  }

  const data = await response.json()

  if (data.status !== 'OK') {
    throw new Error(data.comment || 'API returned error status')
  }

  // Filter for solved problems in this contest
  const solvedProblems = new Set()
  data.result.forEach(submission => {
    if (
      submission.verdict === 'OK' &&
      submission.problem.contestId === parseInt(contestId)
    ) {
      solvedProblems.add(submission.problem.index)
    }
  })

  return solvedProblems
}

/**
 * Fetch single problem information
 */
export const fetchSingleProblem = async (contestId, problemIndex) => {
  const response = await fetch(
    `https://codeforces.com/api/contest.standings?contestId=${contestId}&from=1&count=1`
  )

  if (!response.ok) {
    throw new Error('Failed to fetch problem data')
  }

  const data = await response.json()

  if (data.status !== 'OK') {
    throw new Error(data.comment || 'API returned error status')
  }

  const problem = data.result.problems.find(p => p.index === problemIndex)

  if (!problem) {
    throw new Error('Problem not found')
  }

  return {
    name: `${problem.index}. ${problem.name}`,
    url: buildProblemUrl(contestId, problem.index),
    rating: problem.rating || 0,
    tags: problem.tags || [],
    contestId,
    problemIndex: problem.index,
  }
}
