/**
 * Utilidades para generación de portadas con Canvas
 */

class CoverGenerator {
    constructor(width = 300, height = 300) {
        this.width = width;
        this.height = height;
        this.canvas = document.createElement('canvas');
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = this.canvas.getContext('2d');
    }

    // Generar portada con degradado y texto
    generateGradientCover(title, artist, colors = ['#1a1a2e', '#16213e']) {
        // Degradado de fondo
        const gradient = this.ctx.createLinearGradient(0, 0, this.width, this.height);
        gradient.addColorStop(0, colors[0]);
        gradient.addColorStop(1, colors[1]);
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Título
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 32px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(title, this.width / 2, this.height / 2 - 30);

        // Artista
        this.ctx.font = '20px Arial';
        this.ctx.fillStyle = '#cccccc';
        this.ctx.fillText(artist, this.width / 2, this.height / 2 + 30);

        return this.canvas.toDataURL('image/png');
    }

    // Generar portada con patrón geométrico
    generateGeometricCover(title, colors = ['#ff6b6b', '#4ecdc4', '#45b7d1']) {
        // Fondo
        this.ctx.fillStyle = colors[0];
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Rectángulos
        for (let i = 0; i < 5; i++) {
            this.ctx.fillStyle = colors[i % colors.length];
            this.ctx.globalAlpha = 0.7;
            this.ctx.fillRect(
                (i * this.width) / 5,
                0,
                this.width / 5,
                this.height
            );
        }

        // Texto
        this.ctx.globalAlpha = 1;
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 28px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(title, this.width / 2, this.height / 2);

        return this.canvas.toDataURL('image/png');
    }

    // Generar portada con círculos
    generateCircleCover(title, color = '#667eea') {
        // Fondo
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Círculos concéntricos
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const maxRadius = Math.min(this.width, this.height) / 2;

        for (let i = 3; i > 0; i--) {
            this.ctx.fillStyle = i % 2 === 0 ? color : '#ffffff';
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, (maxRadius * i) / 3, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Texto
        this.ctx.fillStyle = '#000000';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(title, centerX, centerY);

        return this.canvas.toDataURL('image/png');
    }

    // Generar portada con onda
    generateWaveCover(title, color = '#667eea') {
        // Fondo
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Onda
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.height / 2);

        for (let x = 0; x <= this.width; x += 10) {
            const y = this.height / 2 + Math.sin((x / this.width) * Math.PI * 4) * 30;
            this.ctx.lineTo(x, y);
        }

        this.ctx.lineTo(this.width, this.height);
        this.ctx.lineTo(0, this.height);
        this.ctx.fill();

        // Texto
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 28px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(title, this.width / 2, this.height / 2 - 20);

        return this.canvas.toDataURL('image/png');
    }

    // Generar portada aleatoria
    generateRandomCover(title) {
        const generators = [
            () => this.generateGradientCover(title, 'Musify'),
            () => this.generateGeometricCover(title),
            () => this.generateCircleCover(title),
            () => this.generateWaveCover(title)
        ];

        const randomGenerator = generators[Math.floor(Math.random() * generators.length)];
        return randomGenerator();
    }
}

// Instancia global
const coverGenerator = new CoverGenerator();
