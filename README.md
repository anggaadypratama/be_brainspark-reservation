# INITIAL STEP
1. download [NODE JS](https://nodejs.org/en/download/)
2. clone this project `git clone https://github.com/anggaadypratama/BE-BRAINSPARK-RESERVATION`
3. download package using `npm install`
4. run project using `npm run dev` in development mode

# RESPONSE FORMAT

## on success
```
{
    'success': false,
    'data': [],
    'message': 'success'
    'errors': null
}
```

## on fail
```
{
    'success': false,
    'data': [],
    'message': 'Error message',
    'errors': {
        'email': 'wrong email',
        'password': 'wrong password'
    }
}
```