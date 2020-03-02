export class User {
  constructor(
    public email: string,
    public id: string,
    private _token: string,
    private _tokenExpirationDate: Date
  ) {}

  get token() {
    return (
      !this._tokenExpirationDate ||
      new Date() > this._tokenExpirationDate
    ) ? null : this._token;
  }

  set token(token: string) {
    this._token = token;
  }
}
