import ReceiptCash from '../../assets/RKM Donation Receipt Cash.png';
import ReceiptBank from '../../assets/RKM Donation Receipt Bank.png';

// Function to convert number to words
const numberToWords = (num) => {
    const a = [
        '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven',
        'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
    ];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const inWords = (n) => {
        if (n < 20) return a[n];
        const digit = n % 10;
        if (n < 100) return b[Math.floor(n / 10)] + (digit ? '-' + a[digit] : '');
        if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 === 0 ? '' : ' and ' + inWords(n % 100));
        if (n < 100000) return inWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + inWords(n % 1000) : '');
        if (n < 10000000) return inWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + inWords(n % 100000) : '');
        return inWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + inWords(n % 10000000) : '');
    };

    return inWords(num) + " only";
};

const TestPrint = ({ formData }) => {
    const amountInWords = numberToWords(parseInt(formData.amount));

    const finalPurpose = formData.purposeOfDonation.includes('(Please Specify)')
        ? formData.purposeOfDonation.replace('(Please Specify)', `(${formData.specifyPurpose})`)
        : formData.purposeOfDonation;

    return (
        <div id="receipt-container" style={{ position: 'relative', width: '21cm', height: '14.85cm', margin: '0 auto', padding: '0', border: '0', fontFamily: 'Times New Roman, Arial, sans-serif', fontSize: '13pt' }}>
            {formData.donationMethod.toLowerCase() === 'cash' && (
                <img 
                    src={ReceiptCash} 
                    alt="Donation Receipt Background" 
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }} 
                />
            )}

            {(formData.donationMethod.toLowerCase() === 'cheque' || formData.donationMethod.toLowerCase() === 'bank transfer (pos)') && (
                <img 
                    src={ReceiptBank} 
                    alt="Donation Receipt Background" 
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }} 
                />
            )}
            <div style={{ position: 'absolute', top: '4.07cm', left: '2.21cm' }} className='text-lg'>
                {formData.receiptId}
            </div>
            <div style={{ position: 'absolute', top: '4.07cm', left: '15.9cm' }} className='text-lg'>
                {formData.date}
            </div>
            <div style={{ position: 'absolute', top: '5.35cm', left: '6.3cm', width: '15cm' }} className='text-lg'>
                {formData.name}
            </div>
            <div style={{ position: 'absolute', top: '6.19cm', left: '2.45cm', width: '15cm' }} className='text-lg'>
                {formData.address}
            </div>
            <div style={{ position: 'absolute', top: '7.01cm', left: '2.45cm', width: '15cm' }} className='text-lg'>
                {formData.district}, {formData.state}, {formData.city} - {formData.pinCode}
            </div>
            <div style={{ position: 'absolute', top: '7.83cm', left: '2.5cm', width: '15cm' }} className='text-lg'>
                {formData.idType}
            </div>
            <div style={{ position: 'absolute', top: '7.83cm', left: '11.85cm', width: '15cm' }} className='text-lg'>
                {formData.idNo}
            </div>
            <div style={{ position: 'absolute', top: '8.65cm', left: '4.75cm', width: '15cm' }} className='text-lg'>
                {amountInWords}
            </div>
            <div style={{ position: 'absolute', top: '9.48cm', left: '4.5cm', width: '15cm' }} className='text-lg'>
                {formData.donationMethod}
            </div>
            <div style={{ position: 'absolute', top: '10.3cm', left: '4.5cm', width: '15cm' }} className='text-lg'>
                {finalPurpose}
            </div>
            <div style={{ position: 'absolute', top: '11.32cm', left: '0.9cm', width: '15cm' }} className='text-2xl font-medium'>
                {parseFloat(formData.amount).toFixed(2)}
            </div>

            {/* Conditionally render cheque details if donation method is Cheque */}
            {formData.donationMethod === 'Cheque' && (
                <>
                    <div style={{ position: 'absolute', top: '9.48cm', left: '6.1cm', width: '15cm' }} className='text-lg'>
                        &#40;Cheque No: {formData.chequeNo}, Dated: {formData.dated}, On Bank: {formData.onBank}&#41;
                    </div>
                </>
            )}

            <style>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 0;
                    }
                    body {
                        margin: 0;
                        padding: 0;
                    }
                    #receipt-container {
                        width: 100%;
                        height: auto;
                        transform: scale(1);
                        transform-origin: top left;
                        font-size: 12pt;
                    }
                    img {
                        width: 100%;
                        height: auto;
                    }
                }
            `}</style>
        </div>
    );
};

export default TestPrint;