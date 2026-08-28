interface John_skip{
    used: boolean;
}

export default function john_skipped({used}: John_skip) {
    used = true;

    return <div className={`John Skip ${used}`}></div>
}