import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Dashboard = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-blue-900 font-['Segoe_UI_Symbol']">
          Panel Principal
        </h1>
        <p className="text-muted-foreground mt-1">
          Bienvenido al sistema de gestión de cheques.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Próximamente</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Aquí se implementarán las funcionalidades de gestión de cheques.
            El backend se conectará en una fase posterior.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
