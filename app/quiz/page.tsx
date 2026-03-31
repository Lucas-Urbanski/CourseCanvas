export default function Quiz() {
  return (
    <main className="bg-[#F0EBDF] w-screen min-h-screen flex flex-row">
        <div className="bg-[#D6CAB9] w-1/10">
            <div className="flex flex-col text-center pt-10 pb-10">
              <h1 className="pb-3">Q1</h1>
              <h2 className="pb-3">Q2</h2>
              <h1 className="pb-3">Q3</h1>
              <h2 className="pb-3">Q4</h2>
            </div>
        </div>
        <div className="flex justify-center items-center w-9/10 flex-col mt-10">
          <div className="bg-[#D6CAB9] rounded-sm p-8 w-9/10 mb-15">
            <h1>Question 1</h1>
            <p> Why did the chicken cross the road?</p>
            <div className="pt-5 flex flex-col">
              <div className="flex flex-row pb-3">
                <h1 className="pr-64">A: To get to the other side</h1>
                <h1>B: To find it&apos;s walking stick</h1>
              </div>
              <div className="flex flex-row">
                <h1 className="pr-73">C: To get to the KFC</h1>
                <h1>D: Why are you asking the chicken can do what the chicken wants</h1>
              </div>
            </div>
          </div>
          <div className="bg-[#D6CAB9] rounded-sm p-8 w-9/10 mb-15">
            <h1>Question 1</h1>
            <p> Why did the chicken cross the road?</p>
            <div className="pt-5 flex flex-col">
              <div className="flex flex-row pb-3">
                <h1 className="pr-64">A: To get to the other side</h1>
                <h1>B: To find it&apos;s walking stick</h1>
              </div>
              <div className="flex flex-row">
                <h1 className="pr-73">C: To get to the KFC</h1>
                <h1>D: Why are you asking the chicken can do what the chicken wants</h1>
              </div>
            </div>
          </div>
          <div className="bg-[#D6CAB9] rounded-sm p-8 w-9/10 mb-15">
            <h1>Question 1</h1>
            <p> Why did the chicken cross the road?</p>
            <div className="pt-5 flex flex-col">
              <div className="flex flex-row pb-3">
                <h1 className="pr-64">A: To get to the other side</h1>
                <h1>B: To find it&apos;s walking stick</h1>
              </div>
              <div className="flex flex-row">
                <h1 className="pr-73">C: To get to the KFC</h1>
                <h1>D: Why are you asking the chicken can do what the chicken wants</h1>
              </div>
            </div>
          </div>
          <button className="bg-[#D6CAB9] rounded-sm p-2">
            Submit
          </button>
        </div>
    </main>
    );
}