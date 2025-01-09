'use client';

import { useState, useEffect,use } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import axios from 'axios';

export default function TypingTest({ params }) {
  const [slotText, setSlotText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const {id} = use(params)
  useEffect(() => {
    async function fetchSlotData() {
      try {
        const response = await axios.get(`/api/slots/${id}`);
        setSlotText(response.data.slot.text);
      } catch (error) {
        console.error('Failed to fetch slot data', error);
      }
    }

    fetchSlotData();
  }, []);

  useEffect(() => {
    if (slotText) {
      const correctChars = userInput.split('').filter((char, index) => char === slotText[index]).length;
      setScore(correctChars);
    }
  }, [userInput, slotText]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Typing Test</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-gray-700">{slotText}</p>
        <Textarea
          placeholder="Start typing here..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className="mb-4"
        />
        <p><strong>Score:</strong> {score} correct characters</p>
      </CardContent>
    </Card>
  );
}
