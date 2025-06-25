import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';
import PDFDocument from 'pdfkit';

export const generatePDF = async ({ user, event, seats, bookingId }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const fileName = `booking-${bookingId}.pdf`;
      const dirPath = path.join('tickets');
      const filePath = path.join(dirPath, fileName);

      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
      }

      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      doc
        .fontSize(26)
        .fillColor('#0077b6')
        .text('OMNITIX Ticket', { align: 'center' })
        .moveDown(0.5);

      doc
        .fontSize(14)
        .fillColor('#000')
        .text(`Booking ID: ${bookingId}`, { align: 'center' })
        .moveDown(1.5);

      doc
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .strokeColor('#0077b6')
        .lineWidth(1)
        .stroke()
        .moveDown(1);

      doc
        .fontSize(18)
        .fillColor('#023047')
        .text('Event Details')
        .moveDown(0.5);

      doc
        .fontSize(13)
        .fillColor('#000')
        .text(`Title: ${event.title}`)
        .text(`Date & Time: ${new Date(event.date).toLocaleDateString()} at ${event.time}`)
        .text(`Category: ${event.category}`)
        .text(`Seats Booked: ${seats.join(', ')}`)
        .text(`Price per Seat: ${event.price}`)
        .text(`Total Price: ${event.price * seats.length}`)
        .moveDown(1);

      doc
        .fontSize(18)
        .fillColor('#023047')
        .text('User Details')
        .moveDown(0.5);

      doc
        .fontSize(13)
        .fillColor('#000')
        .text(`Name: ${user.name}`)
        .text(`Email: ${user.email}`)
        .moveDown(1);

      const qrData = `Booking ID: ${bookingId} | Name: ${user.name} | Event: ${event.title}`;
      const qrImage = await QRCode.toDataURL(qrData);

      doc
        .fontSize(18)
        .fillColor('#023047')
        .text('QR Code', { align: 'center' })
        .moveDown(0.5);

      doc.image(qrImage, {
        fit: [150, 150],
        align: 'center',
        valign: 'center',
      });

      doc.end();

      stream.on('finish', () => resolve(filePath));
      stream.on('error', reject);
    } catch (err) {
      console.error('PDF generation error:', err);
      reject(err);
    }
  });
};
