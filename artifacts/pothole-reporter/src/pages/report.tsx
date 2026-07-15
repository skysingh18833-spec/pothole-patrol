import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useCreateReport, getListReportsQueryKey, getGetReportStatsQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { MobileNav } from '@/components/MobileNav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Camera, MapPin, Loader2, CheckCircle2, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

export default function Report() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [damageType, setDamageType] = useState('pothole');
  const [severity, setSeverity] = useState('medium');
  const [description, setDescription] = useState('');
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [location, setLocationState] = useState<{ lat: number; lon: number; address?: string } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const createReport = useCreateReport();

  // Get GPS location on mount
  useEffect(() => {
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocationState({ lat: latitude, lon: longitude });
        
        // Reverse geocode
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { 'User-Agent': 'RoadDamageReporter/1.0' } }
          );
          const data = await response.json();
          setLocationState({ lat: latitude, lon: longitude, address: data.display_name });
        } catch (err) {
          setLocationState({ lat: latitude, lon: longitude });
        }
        setLocationLoading(false);
      },
      (error) => {
        setLocationError(error.message);
        setLocationLoading(false);
      }
    );
  }, []);

  // Initialize camera
  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        setCameraStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setCameraError('Camera access denied or unavailable');
      }
    };
    
    initCamera();
    
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const base64 = canvas.toDataURL('image/jpeg', 0.7);
        // Strip data URL prefix
        const base64Data = base64.split(',')[1];
        setPhotoBase64(base64Data);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        const base64Data = base64.split(',')[1];
        setPhotoBase64(base64Data);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!location) {
      toast({
        title: 'Location required',
        description: 'Waiting for GPS location...',
        variant: 'destructive',
      });
      return;
    }

    createReport.mutate(
      {
        data: {
          damageType,
          severity,
          description: description || undefined,
          latitude: location.lat,
          longitude: location.lon,
          address: location.address,
          photoBase64: photoBase64 || undefined,
        },
      },
      {
        onSuccess: (report) => {
          toast({
            title: 'Report submitted',
            description: 'Your road damage report has been recorded.',
          });
          
          queryClient.invalidateQueries({ queryKey: getListReportsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetReportStatsQueryKey() });
          
          setLocation(`/reports/${report.id}`);
        },
        onError: () => {
          toast({
            title: 'Submission failed',
            description: 'Could not submit report. Please try again.',
            variant: 'destructive',
          });
        },
      }
    );
  };

  return (
    <div className="min-h-[100dvh] bg-background pb-20">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">Submit Report</h1>
          <p className="text-muted-foreground mb-6">Document road damage in your area</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Camera/Photo */}
          <Card className="p-6">
            <Label className="text-base font-semibold mb-4 block">Photo Evidence</Label>
            
            {!photoBase64 ? (
              <div className="space-y-4">
                {cameraStream && !cameraError ? (
                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                      data-testid="video-camera"
                    />
                    <Button
                      type="button"
                      size="lg"
                      onClick={capturePhoto}
                      className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full w-16 h-16 p-0"
                      data-testid="button-capture"
                    >
                      <Camera className="w-6 h-6" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground mb-4">{cameraError}</p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      data-testid="button-upload"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Photo
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileUpload}
                      className="hidden"
                      data-testid="input-file"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
                  <img
                    src={`data:image/jpeg;base64,${photoBase64}`}
                    alt="Captured"
                    className="w-full h-full object-contain"
                    data-testid="img-captured"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPhotoBase64(null)}
                  className="w-full"
                  data-testid="button-retake"
                >
                  Retake Photo
                </Button>
              </div>
            )}
            
            <canvas ref={canvasRef} className="hidden" />
          </Card>

          {/* Location */}
          <Card className="p-6">
            <Label className="text-base font-semibold mb-4 block flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Location
            </Label>
            
            {locationLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Acquiring GPS location...
              </div>
            ) : locationError ? (
              <div className="text-sm text-destructive" data-testid="text-location-error">
                {locationError}
              </div>
            ) : location ? (
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-mono text-xs text-muted-foreground mb-1" data-testid="text-coordinates">
                      {location.lat.toFixed(6)}, {location.lon.toFixed(6)}
                    </div>
                    {location.address && (
                      <div className="text-sm" data-testid="text-address">
                        {location.address}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </Card>

          {/* Damage Type */}
          <Card className="p-6">
            <Label className="text-base font-semibold mb-4 block">Damage Type</Label>
            <RadioGroup value={damageType} onValueChange={setDamageType}>
              <div className="grid grid-cols-2 gap-3">
                {['pothole', 'crack', 'subsidence', 'flooding', 'debris', 'other'].map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <RadioGroupItem value={type} id={type} data-testid={`radio-type-${type}`} />
                    <Label htmlFor={type} className="capitalize cursor-pointer font-normal">
                      {type}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </Card>

          {/* Severity */}
          <Card className="p-6">
            <Label className="text-base font-semibold mb-4 block">Severity Level</Label>
            <RadioGroup value={severity} onValueChange={setSeverity}>
              <div className="space-y-3">
                {[
                  { value: 'low', label: 'Low', desc: 'Minor surface damage' },
                  { value: 'medium', label: 'Medium', desc: 'Noticeable hazard' },
                  { value: 'high', label: 'High', desc: 'Significant risk' },
                  { value: 'critical', label: 'Critical', desc: 'Immediate danger' },
                ].map((option) => (
                  <div key={option.value} className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value={option.value} id={option.value} className="mt-1" data-testid={`radio-severity-${option.value}`} />
                    <Label htmlFor={option.value} className="cursor-pointer flex-1 font-normal">
                      <div className="font-semibold">{option.label}</div>
                      <div className="text-xs text-muted-foreground">{option.desc}</div>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </Card>

          {/* Description */}
          <Card className="p-6">
            <Label htmlFor="description" className="text-base font-semibold mb-4 block">
              Additional Details (Optional)
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the damage, hazards, or other relevant information..."
              rows={4}
              data-testid="textarea-description"
            />
          </Card>

          {/* Submit */}
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={!location || createReport.isPending}
            data-testid="button-submit"
          >
            {createReport.isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Report'
            )}
          </Button>
        </form>
      </div>

      <MobileNav />
    </div>
  );
}
