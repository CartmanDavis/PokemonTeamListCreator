/** Problems with the pasted team, each with a message meant to be shown to the user. */
export class TeamsheetError extends Error {
  readonly issues: string[]

  constructor(issues: string[]) {
    super(issues.join('\n'))
    this.name = 'TeamsheetError'
    this.issues = issues
  }
}
