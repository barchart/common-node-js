function sqrt(num){
    for (let i=1;i<=Math.floor(num/2);i++){
        if(i*i==num){
            return i
        }
    }
}

console.log(sqrt(49));