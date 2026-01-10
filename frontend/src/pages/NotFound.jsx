import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Home, AlertTriangle } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-slate-400" />
        </div>
        <h1 className="font-heading text-4xl font-bold text-slate-900 mb-4">
          404
        </h1>
        <p className="text-lg text-slate-600 mb-8">
          Diese Seite existiert nicht.
        </p>
        <Link to="/">
          <Button className="bg-slate-900 hover:bg-slate-800 text-white">
            <Home className="w-4 h-4 mr-2" />
            Zur Startseite
          </Button>
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
