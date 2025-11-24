import { useQuery } from '@tanstack/react-query';
import {
  parseCodeforcesUrl,
  fetchContestProblems,
  fetchUserSubmissions,
  fetchSingleProblem,
} from '../utils/codeforcesApi';

/**
 * Hook to fetch and process Codeforces problems from a URL
 */
export const useCodeforcesProblems = (url, username, enabled = true) => {
  return useQuery({
    queryKey: ['codeforces', url, username],
    queryFn: async () => {
      const parsed = parseCodeforcesUrl(url);
      
      if (parsed.type === 'invalid') {
        throw new Error('Invalid Codeforces URL');
      }
      
      if (parsed.type === 'contest') {
        // Fetch all problems in the contest
        const problems = await fetchContestProblems(parsed.contestId);
        
        // Fetch user's solved problems
        if (username) {
          const solvedProblems = await fetchUserSubmissions(username, parsed.contestId);
          
          // Filter out solved problems
          return problems.filter(problem => !solvedProblems.has(problem.problemIndex));
        }
        
        return problems;
      }
      
      if (parsed.type === 'problem') {
        // Fetch single problem
        const problem = await fetchSingleProblem(parsed.contestId, parsed.problemIndex);
        return [problem];
      }
      
      return [];
    },
    enabled: enabled && !!url,
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
