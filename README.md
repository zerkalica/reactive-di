# reactive-di

Dependency injection + [derivable](https://github.com/ds300/derivablejs)

```js
// @flow

import {init, key, service, derivable} from 'reactive-di/annotations'
import {Di} from 'reactive-di'

function loadUser(log: Log) {
    log.log('loadUser')

    return [
      new User('loading'),
      Promise.resolve(new User('loaded'))
    ]
}
derivable(loadUser)

@key('User')
@init(loadUser)
class User {
  name: string;
  constructor(name: string) {
    this.name = name
  }
}

@key('LogData')
class LogData {
  prefix: string;
  constructor(prefix: string) {
    this.prefix = prefix
  }
}

@service
class Log {
  ld: LogData;
  constructor(logData: LogData) {
    this.ld = logData
  }
  log(msg: string): void {
    console.log(this.ld.prefix, log)
  }
}

@service
class UserService {
  log: Log;
  user: User;
  constructor(log: Log, user: User) {
     this.log = log
     this.user = user
  }

  getUser() {
    this.log.log('getUser')
    console.log(this.user)
    return this.user
  }
}

const di = (new Di())
  .values({
    LogData: new LogData('test')
  })

const userService = di.get(UserService).get()
// test loadUser
// loading
// loaded

userService.getUser()
// test getUser

di.get(User).set(new User('changed'))
```
