import * as React from "react";
import { getAnalysis } from "./Analysis";

export default function App() {
  const [reproHealth, setRepoHealth] = React.useState<any>();

  React.useEffect(() => {
    getAnalysis().then(results => {
      setRepoHealth(results);
      console.log("results", results);
    });
  }, []);

  const { issues = [], issuesByComponent = [], labels = [], mentions = {} } =
    reproHealth || {};

  const Mentions = (
    <>
      <h2>Mentions</h2>
      {Object.keys(mentions).map((personName: string, i: number) => {
        const issuesByPerson = mentions[personName];
        return (
          <>
            <div>{personName}</div>
            {issuesByPerson.map((issue: any, i: number) => (
              <a key={i} style={{ display: "block" }} href={issue.html_url}>
                {issue.title}
              </a>
            ))}
          </>
        );
      })}
    </>
  );

  const Labels = (
    <>
      <h2>Labels</h2>
      {Object.keys(labels).map((componentName: string, i: number) => (
        <div key={i}>
          {componentName}: {labels[componentName]}
        </div>
      ))}
    </>
  );

  const BugsByComponent = (
    <>
      <h2>Issues</h2>
      {Object.keys(issuesByComponent).map((componentName: string) => {
        const issues = issuesByComponent[componentName];

        return (
          <div>
            <h3>
              {componentName} ({issues.length})
            </h3>
            {issues.map((issue: any, i: number) => (
              <React.Fragment key={i}>
                <a style={{ display: "block" }} href={issue.html_url}>
                  {issue.title}
                </a>
                <div>{new Date(issue.created_at).toString()}</div>
                <div>
                  {issue.labels
                    .map((l: any) => l.name)
                    .filter(
                      (name: string) =>
                        name !== "Area: Accessibility" &&
                        name.indexOf("Component:") !== 0
                    )
                    .join(", ")}
                </div>
                <br />
              </React.Fragment>
            ))}
          </div>
        );
      })}
    </>
  );

  return (
    <div>
      <h1>A11y issues in Github</h1>
      <h2>Total open issues: {issues.length}</h2>

      {BugsByComponent}

      {Labels}

      {Mentions}
    </div>
  );
}
