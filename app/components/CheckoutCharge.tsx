import {
  BlockStack,
  Card,
  DatePicker,
  Text,
  TextField,
} from "@shopify/polaris";
import { useState } from "react";

type SelectedDates = {
  start: Date;
  end: Date;
};

type CheckoutChargeProps = {
  selectedDates: SelectedDates;
  setSelectedDates: (dates: SelectedDates) => void;
  initialCheckoutCharge: number;
  setInitialCheckoutCharge: (charge: number) => void;
};

export default function CheckoutCharge({
  selectedDates,
  setSelectedDates,
  initialCheckoutCharge,
  setInitialCheckoutCharge,
}: CheckoutChargeProps) {
  const today = new Date();
  console.log("today new Date()", today);
  const [{ month, year }, setDate] = useState({
    month: today.getMonth(),
    year: today.getFullYear(),
  });
  const handleMonthChange = (month: number, year: number) =>
    setDate({ month, year });
  return (
    <Card>
      <BlockStack gap="400">
        <TextField
          label="Initial deposit"
          name="checkoutCharge"
          type="number"
          suffix="%"
          value={initialCheckoutCharge}
          onChange={setInitialCheckoutCharge}
          max={100}
          autoComplete="off"
        />
        {initialCheckoutCharge < 100 && (
          <BlockStack>
            <Text as="p">Remaining balance charge date</Text>
            <DatePicker
              month={month}
              year={year}
              onChange={setSelectedDates}
              onMonthChange={handleMonthChange}
              selected={selectedDates}
              // allowRange
            />
          </BlockStack>
        )}
      </BlockStack>
    </Card>
  );
}
