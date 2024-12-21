"use client"
import React, { useState } from 'react';
import axios from 'axios';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"


export default function Home() {
  const { toast } = useToast()
  const [expense, setExpense] = useState('');
  const [loading, setLoading] = useState(false);
  const [intent, setIntent] = useState('');
  const [result, setResult] = useState('');
  const [backendContent, setBackendContent] = useState('');


  const handleSubmit = async () => {
      try {
        setLoading(true);
        console.log("sending",{expense});
        const res = await axios.post('http://localhost:8000/api/chatQuery/intent', { expense, mode: 'chat' });
        // const res = await axios.post('http://localhost:8000/api/bulkAdd/bulkAdd', { expense });

        const { response, intent, content } = res.data;
        console.log(content);

        setIntent(intent);
        setResult(content);
        setLoading(false);

        switch (intent) {
          case 'adding':
            toast({
              description: response,
              variant: 'default',
            });
            break;
          case 'not an expense':
            toast({
              description: 'Enter an expense if you would like to add an expense',
              variant: 'default',
            });
            break;
        }
        //   setLoading(true);
        //   console.log(expense);
        //   const res = await axios.post('http://localhost:8000/api/expenses/analyze', { expense });
        //   setLoading(false);

        //   switch(res.data.json.intent) {
        //     case 'adding':
        //       setResult(res.data.json.response);
              
        //       break;
        //     case 'retrieving':
        //       setResult(res.data.json.response);
              
        //       break;
        //     case 'not an expense':
              
        //       break;
            
        //   }

        //   toast({
        //     description: res.data.message,
        //     variant: 'default',
        // })
      } catch (error) {
          console.error('Error sending response:', error);
      }
  };

  return (
    <section className="m-10 flex flex-col gap-4">
      <Label htmlFor="expense" className="text-[#e6e0e0] font-bold">Enter Your Expense :</Label>
      <Input 
        id="expense" 
        className="bg-[#e6e0e0] border-2 border-[#A7D477]" 
        type="text"
        value={expense}
        onChange={(e) => setExpense(e.target.value)}
      />
      <Button variant={"outline"} onClick={handleSubmit} disabled={loading}>
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="spinner-border animate-spin inline-block w-4 h-4 border-2 rounded-full"></span>
            Sending...
          </span>
        ) : (
          "Send Expense"
        )}
      </Button>
      {(<div className='text-[#e6e0e0] font-bold' dangerouslySetInnerHTML={{ __html: result }}></div>)}
    </section>
  );
}
