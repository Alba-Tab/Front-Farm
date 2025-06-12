--USAR TABLA PREVENTAS
USE preventas

/*Hacer un TRIGGER denominado TR_upd_venta, que realice los siguientes procesos después de insertar un producto en el detalle de venta:

1. Actualizar el precio e importe del producto insertado de la preventa dada, el precio y el importe es calculado de la siguiente manera:

Precio = 10% mas que el Precio Promedio Ponderado (PPP) del producto suministrado en el almacén donde se esta realizando la compra
Importe = Precio x Cantidad
2. Actualizar el Importe Total de la preventa, el mismo que es calculado de la siguiente manera:

Importe Productos = sumar los importes de cada producto del detalle de la preventa
Importe IVA = Es el 13% sobre el Importe Productos
Importe Gasto Transporte = Es el 13% sobre del (Importe IVA.+  Importe Productos)
Importe Total Preventa = ( Importe Productos + Importe IVA + Importe Gasto Transporte )
3. Actualizar el Importe Descuento de la preventa, el mismo que es calculado de la siguiente manera:

Si el cliente es nuevo se aplica un descuento del 5% del Importe Total Preventa, de lo contrario el 10% 
Si tiene por lo menos dos producto con el mismo color se aplica un descuento del 10% del Importe Productos
---------------------------------------------------------------------------------------------
EJEMPLO: Calculo del Precio Promedio Ponderado (PPP)  

El PPP determina el costo de cada producto del inventario y la cantidad de unidades asociadas a ellos.  Por ejemplo, si en un almacén en particular se tiene los siguientes ingresos de un producto XYZ

Fecha         Cantidad      Precio 
15/05/2015       5                $12 
18/06/2015     15                $15 
01/01/2015     10                $10 
Para el Calculo del PPP del producto en particular en el almacén determinado, se procede de la siguiente manera:

1. Multiplique la cantidad por el precio de cada ingreso del producto suministrado en el almacén

Fecha        Cantidad   Precio       Importe
01/01/2015      10   x      $10          = $100 
15/05/2015       5    x      $12          =  $60
18/06/2015      15   x      $15          = $225
2. Sume las cantidades y los importes de la lista 

       Suma de Cantidades = 30
       Suma de Importes     = $385
3. Calcular el PPP

PPP = Suma de Importes / Suma de Cantidad
PPP = $385/30  =  12.8333   */


-- SOLUCION
--Creamos el Trigger
CREATE TRIGGER TR_upd_venta
	ON dventas
	FOR INSERT
	AS
		DECLARE @cprd INT, @nvta INT,@calm INT,
				@cant DECIMAL(12,2), @prec DECIMAL(12,2), @impt DECIMAL(12,2)
		--lee datos de la ultima fila de la tabla INSERTED
		SELECT @cprd=cprd,@nvta=nvta,@cant=cant  FROM INSERTED
		--Lee el codigo del almacen de la tabla pventas
		SELECT @calm=calm FROM pventas WHERE nvta=@nvta
		--Calculo del precio en base al PPP + el 10%
		SET @prec = dbo.PPP(@cprd,@calm) + (dbo.PPP(@cprd,@calm)*0.1)
		--Calculo del importe 
		SET @impt = @cant * @prec 
		--Se actualiza el precio e importe de cada producto 
		UPDATE dventas SET prec=@prec, impt=@impt WHERE nvta=@nvta AND cprd=@cprd
		
		--se actualiza el importe total de la preventa 
		UPDATE pventas SET iTot=dbo.Impt_Total(@nvta) WHERE nvta=@nvta 
		--se actualiza el importe total de de descuento  de la preventa
		UPDATE pventas SET ides=dbo.Calcular_Descuento(@nvta)	WHERE nvta=@nvta

		RETURN 

	----PRUEBA
	select * from dventas
	select * from pventas
	select * from log_pventas

	DELETE FROM log_pventas
	DELETE FROM dventas
	DELETE FROM pventas WHERE nvta=1
	 
	INSERT INTO pventas VALUES(1,'Pablo',2,GETDATE(),0,0)

	INSERT INTO dventas VALUES(1,1,3,0,0)
	INSERT INTO dventas VALUES(1,2,3,0,0)
	INSERT INTO dventas VALUES(1,3,5,15,75)
	------------------------------------------------------------------
	--Funcion que calcula el importe Total de una PreVenta
	CREATE FUNCTION Impt_Total(@nvta INT)
	RETURNS DECIMAL(12,2)
	AS 
	BEGIN
		DECLARE @ImptProducto DECIMAL(12,3), @ImptIva DECIMAL(12,3), @ImptTrans DECIMAL(12,3),
				@@ImptTotal DECIMAL(12,3)
		SET @ImptProducto = dbo.Importe_Producto(@nvta)
		SET @ImptIva =  @ImptProducto*0.13
		SET @ImptTrans =0.13* (@ImptProducto + @ImptIva)
		SET @@ImptTotal =@ImptProducto + @ImptIva + @ImptTrans
		RETURN @@ImptTotal
	END

	PRINT dbo.Impt_Total(1)

	--FUCNTION para calcular el Importe Productos

	CREATE OR ALTER FUNCTION Importe_Producto(@nvta INT)
	RETURNS DECIMAL(12,2)
	AS 
	BEGIN 
		RETURN (SELECT ISNULL(SUM(impt),0) FROM dventas WHERE nvta=@nvta)
	END

	--Funcion de importe descuento
	CREATE FUNCTION Impt_Desc(@nvta INT)
	RETURNS DECIMAL(12,2)
	AS 
	BEGIN
		DECLARE @ImptProducto DECIMAL(12,2), @ImptDesc DECIMAL(12,2),@ImptTotal DECIMAL(12,2),
				@nomb char(40)
		SET @ImptDesc = 0
		SET @ImptTotal = dbo.Impt_Total(@nvta)
		SET @ImptProducto = dBO.Importe_Producto(1)
		SET @nomb = (SELECT nomc FROM pventas WHERE nvta=@nvta)
		IF(dbo.ClienteNuevo(@nomb) = 1)
			SET @ImptDesc = @ImptDesc +@ImptTotal * 0.05
		ELSE
			SET @ImptDesc = @ImptDesc +@ImptTotal * 0.1

		IF(dbo.MismoColor2(@nvta) >= 2)
			SET @ImptDesc = @ImptDesc +@ImptProducto * 0.1

		
		RETURN @ImptDesc
	END

	--funcion para contar cuantas preventa tiene el cliente 
	CREATE FUNCTION ClienteNuevo(@nomb char(40))
	RETURNS INT 
	AS
	BEGIN
			RETURN (SELECT COUNT(*) FROM pventas where nomc=@nomb)
	END

	--Funcion para cuantos productos tienen el mismo color en el datalle de la preventa
	CREATE FUNCTION MismoColor2(@nvta INT) 
	RETURNS INT
	AS
	BEGIN
		DECLARE @cant DECIMAL(12,2),@cant_Color INT, @color CHAR(20)
		DECLARE c_lista CURSOR FOR
			SELECT colo,COUNT(*) cant FROM dventas,prod
			WHERE dventas.cprd=prod.cprd and nvta=@nvta 
			GROUP BY colo
			HAVING COUNT(*)>=2
		SET @cant_Color = 0
		OPEN c_lista
		FETCH c_lista INTO @color,@cant
		IF (@@FETCH_STATUS = 0)
				SET @cant_Color = 2

		RETURN @cant_Color
	END