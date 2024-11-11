export default function getCurrentDate(): string {
    const today = new Date();

    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, "0"); // Месяц от 0 до 11, поэтому +1
    const day = today.getDate().toString().padStart(2, "0"); // День всегда 2 символа

    return `${year}-${month}-${day}`;
}
