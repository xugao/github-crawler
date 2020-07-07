import { Octokit } from "@octokit/rest";

const github = new Octokit({
  log: console
});
const repoDetails = {
  owner: "microsoft",
  repo: "fluentui"
};

async function getA11yIssues(pageIndex = 1, perPage = 100) {
  const results = await github.search.issuesAndPullRequests({
    q: [
      `repo:${repoDetails.owner}/${repoDetails.repo}`,
      "is:open",
      "is:issue",
      'label:"Area: Accessibility"'
    ].join("+"),
    page: pageIndex,
    per_page: perPage
  });

  if (results.status !== 200) {
    throw new Error("API returned error: " + results.status);
  }

  return results.data;
}

async function getA11yIssuesWithPagination() {
  let pageIndex = 1;
  let perPage = 100;
  let resultCount = perPage;
  let issues: any[] = [];

  const firstPageResults = await getA11yIssues(pageIndex, perPage);
  issues = issues.concat(firstPageResults.items);
  let totalCount = firstPageResults.total_count;

  while (totalCount > resultCount) {
    pageIndex++;
    const data = await getA11yIssues(pageIndex, perPage);
    issues = issues.concat(data.items);
    resultCount = issues.length;
  }

  return issues;
}

function objectToArray(obj: any, sortBy?: (item: any) => number) {
  let result: any = [];
  Object.keys(obj).forEach(k => {
    result.push({ [k]: obj[k] });
  });

  if (sortBy) {
    return result.sort((a: any, b: any) => sortBy(b) - sortBy(a));
  }

  return result;
}

function sortObject(obj: any, sortBy?: (item: any) => number) {
  const sortedObj: any = {};
  const arr: any[] = objectToArray(obj, sortBy);

  for (const element of arr) {
    const key = Object.keys(element)[0];
    sortedObj[key] = element[key];
  }

  return sortedObj;
}

export async function getAnalysis() {
  const issues = await getA11yIssuesWithPagination();

  let labels: any = {};
  const issuesByComponent: any = {};
  const mentions: any = {};

  for (const issue of issues) {
    let componentName: string | undefined = undefined;

    issue.labels.forEach((label: any) => {
      const labelName = label.name;
      if (labelName === "Area: Accessibility") {
        return;
      }

      if (labelName.indexOf("Component:") === 0) {
        componentName = labelName.split(": ")[1];
      } else if (labelName.indexOf("Package:") === 0) {
        componentName = labelName;
      }

      if (labels[labelName] === undefined) {
        labels[labelName] = 1;
      } else {
        labels[label.name] = labels[label.name] + 1;
      }
    });

    if (!componentName) {
      componentName = "Component: Unknown";
    }

    issuesByComponent[componentName] = issuesByComponent[componentName] || [];
    issuesByComponent[componentName].push(issue);

    // if (issue.comments > 0 && issue.comments_url) {
    //   const comments: any[] = await getComments(issue.comments_url);
    //   for (const comment of comments) {
    //     let mentionName;
    //     if (comment.body.indexOf("@betrue-final-final") > -1) {
    //       mentionName = "Ben Truelove";
    //     } else if (comment.body.indexOf("@jurokapsiar") > -1) {
    //       mentionName = "Juraj";
    //     }

    //     if (mentionName) {
    //       mentions[mentionName] = mentions[mentionName] || [];
    //       mentions[mentionName].push(issue);
    //       break;
    //     }
    //   }
    // }
  }

  return {
    issues,
    issuesByComponent: sortObject(
      issuesByComponent,
      (item: any) => item[Object.keys(item)[0]].length
    ),
    mentions,
    labels: sortObject(labels, (item: any) => item[Object.keys(item)[0]])
  };
}

async function getComments(url: string): Promise<any[]> {
  const result = await fetch(url, {
    headers: new Headers({})
  });
  const json = await result.json();
  return json;
}
