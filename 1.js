/**
 1. Thuật toán kiểm tra chuỗi đối xứng.
    Cho một chuỗi s, viết một thuật toán để kiểm tra xem chuỗi đó có phải là chuỗi đối xứng hay không. Một chuỗi đối xứng là chuỗi có thứ tự ký tự giống nhau 
    khi đọc từ trái sang phải và từ phải sang trái. Ví dụ: "radar" và "level" là các chuỗi đối xứng.

    Đầu Vào
        Một chuỗi s chứa các ký tự chữ cái, chữ số và ký tự đặc biệt (0 ≤ độ dài của s ≤ 10^5).
    Đầu Ra
        Trả về true nếu chuỗi s là chuỗi đối xứng, ngược lại trả về false.

    Ví Dụ
        Ví Dụ 1:
            Input: "level"
            Output: true
            Giải Thích: "level" đọc từ trái sang phải và từ phải sang trái đều giống nhau.
        Ví Dụ 2:
            Input: "hello"
            Output: false
            Giải Thích: "hello" không giống nhau khi đọc từ hai chiều.
*/

function isPalindrome(s) {
    const newString = s.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

    let left = 0;
    let right = newString.length - 1;

    while (left < right) {
        if (newString[left] !== newString[right]) {
            return false;
        }
        left++;
        right--;
    }
    return true;
}

// console.log("0.", isPalindrome("hello"));
// console.log("1.", isPalindrome(""));
// console.log("2.", isPalindrome("a"));
// console.log("3.", isPalindrome("a b a"));
// console.log("4.", isPalindrome("radAr"));
console.log("7.", isPalindrome("A man, a plan, a canal, Panama"));
console.log("8.", isPalindrome("No 'x' in Nixon"));
console.log("9.", isPalindrome("Was it a car or a cat I saw"));

